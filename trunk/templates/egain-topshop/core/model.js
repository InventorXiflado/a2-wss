define(['backbone', 'underscore', 'core/app', 'plugins/cookies/init'], function(Backbone, _, app){
    
    // Model
    //------
    var Model = Backbone.Model.extend({
        
        /** Returns the current portal Id. **/
        getPortalId : function() {
            
            if(window.app) 
                return window.app.getPortalId();
        },

        _getSessionId : function() {

            if(window.app) {
                
                var sessionIdStr = window.app.sessionId || window.app.getSSOSessionId();
                if (!sessionIdStr) {
                    sessionIdStr = window.app.getQs("WS_UUID");
                    if (sessionIdStr) {
                        this._saveSessionId(sessionIdStr);
                        window.app.qs["WS_UUID"] = null;
                    }
                }

                if (!sessionIdStr) {
                   sessionIdStr =  $.cookie('sessionId');
                }
                return sessionIdStr;
            }
        },
        
        _getSSORequestId : function() {

            var ssoStr = null;
            var search = location.search.substring(0);
            if(search.indexOf("?") == 0)
                search = search.substring(1);
            var searchParams = search.split('&');
            for(var i=0;i<searchParams.length;i++)
            {
                var pair = searchParams[i].split('=');
                var name = pair[0];
                var val = pair[1];
                if(name == 'SSO_STR')
                {
                    ssoStr = val;
                    break;
                }
            }
            return ssoStr;
        },
        
        _setSessionId : function(session_id) {
            
            if(session_id) {
                //Expose it to the global app object.
                window.app.sessionId = session_id;

                this._saveSessionId(session_id);
            }
        },

        _saveSessionId : function(session_id) {
            
            //var session_expire = window.app.getconfig('session-expire');
            var session_expire = 900;

            $.cookie('sessionId', session_id, {
                
                //Set the cookie to expire in a day. 
                //TODO: change it to minute format.
                expires : 1
            });
        },

        setProperties : function(properties) {

            this._properties = properties || {};    
        },

        getProperty : function(key, defaultValue) {

            return window.app.manifest.compileValue(this._properties[key] || defaultValue);
        },

        /** Setter method for model path - the one specified in manifrst.json 
         * (e.g. standard.portal.article) 
         */
        setModelPath : function(pathString) {
        	this._path = pathString;
        },
        
        /** Getter method for model path */
        getModelPath : function() {
        	return this._path;
        },
        
        makeRequest : function(obj) {
            
            //With makeRequest, the url is already complete.
            obj.completeUrl = obj.url;

            return this.request(obj);
        },
        
        /** Submits an ajax request */
        request : function(obj){

        	// request data
            var ajax = {};
            
            // set context for all the ajax callbacks (which is the model itself).
            ajax.context = obj.context;
                
            // request type (usually GET or POST)
            ajax.type = obj.method || 'GET';

            // request URL
            if(!obj.url && !obj.completeUrl)
                throw new Error('Request must specify URL.');
            
            ajax.url = url = obj.completeUrl || obj.full_url || this._generateCompleteUrl(obj.url);
            
            // request data. Prepend portalId as every request has to have it.
            ajax.data = _.extend({portalId:this.getPortalId()}, obj.data);
            
            // determine the user type and add it to the request data
            var usertype = this.getUserType();
            ajax.data = _.extend(ajax.data, {'usertype' : usertype});

            // if request type is JSON
            if(obj.type == 'json') {
                
                // extend request data to include JSON format
                ajax.data = _.extend(ajax.data, {'$format' : 'json'});
                // set json accept header
                ajax.headers = {'Accept' : 'application/json', 'Content-Type':'application/json'};

            } else {  // non-json type = xml

                // set xml accept header
                ajax.headers = {'Accept' : 'application/xml'};
            }
            
            //Status Code Callbacks
            var statusCode = {};

            //Success Codes
            var success_codes = obj.success_codes && [200].concat(obj.success_codes) || [200];

            _.map(success_codes, function(code) {
                statusCode[code] = obj.success;
            });
            
            //Error Codes
            var error_codes = obj.error_codes && [404].concat(obj.error_codes) || [404];

            _.map(error_codes, function(code) {
                statusCode[code] = obj.error;
            });

            // take care of 401 response (unauthorized access) or 412 (precondition failed)
            // use the passed in handlers if available.
            statusCode[401] = statusCode[401] || _.bind(this._unauthorizedCallback, this);
            statusCode[412] = statusCode[412] || _.bind(this._unauthorizedCallback, this);

            ajax.statusCode = statusCode;
            
            ajax.traditional = true;

            // array of functions to be executes on request completion
            ajax.complete = [];
            if(obj.complete)
                ajax.complete.push(obj.complete);

            /* If we know eGain sessionID, use it in the request. Otherwise,
             * record it from the response. */
            if(this._getSessionId()){ 

            	// if we have eGain sessionID stored, the ajax requests should be submitted
            	// in the usual asynchronous mode
            	ajax.async = true;
            	 
            	// set x-egain-session header
                _.extend(ajax.headers, {
                    'X-egain-session' : this._getSessionId()
                });
                    
            } else {

            	/* if we don't have eGain sessionID stored (user accessing the portal for the first time)
            	 * we make this ajax requests synchronous because we want to make sure no more requests are
            	 * submitted until this one returns. Then we read and store the returned eGain sessionID and
            	 * switch back to asynchronous mode on the next requst. 
            	 */
            	ajax.async = false;
                
            	// capture eGain sessionID on the request completion
                ajax.complete.push(_.bind(this._captureSessionId, this));
            }

			if(this._getSSORequestId())
            {
                _.extend(ajax.headers, {
                    
                    'x-egain-sso-session' : this._getSSORequestId()
                });
            }
			/* If the request type is post or delete, add query params to url */
            if( ajax.type != 'GET' )
            	ajax.url = this.appendRequiredData(ajax.url , obj.type);

            return $.ajax(ajax);
        },

        appendRequiredData : function(url , responseRequired) {
        
        	var appendData = { };
        	appendData.portalId = this.getPortalId();
        	var usertype = this.getUserType();
        	appendData.usertype = usertype;
        	if( responseRequired == 'json' )
        		appendData['$format'] = responseRequired;
        	return window.app.addQueryStrParamsToUrl(url, appendData);
        
        },
            
        getUserType : function () {

        	if(window.app.isAgentPortal()) {
		      	var usertype  = 'agent';
	        }
	        else {
	            	var usertype = 'customer';
        	}
        	return usertype;        
        },


        /**
         * This function is called in case of 401 or 412 error codes returned by WS APIs.
         * The above codes would mean that either the user is not authorised to access the url
         * (login required), or in case of existing sesionId usertype doesn't match the session
         * stored on the server. In the latter, it's possible the session has expired or stored
         * sessionId got reused for a different session. 
         * In all these cases we need to restart the session and redirect to the login page in 
         * agent or authorised customer portals.
         */
        _unauthorizedCallback : function(data) {
            
            var loginPage = window.app.manifest.getProjectVar('loginPage') || 'login';
            var signupPage = 'signup';
            var forgotPasswordPage = 'forgot_password';

        	var loginPagesArray = [window.app.getPageUrl(loginPage),
                                   window.app.getPageUrl(signupPage),
                                   window.app.getPageUrl(forgotPasswordPage)];
        	var currentPageUrl = window.app.getCurrentUrl();

        	/*
        	* REDIR_URL parameter would contain the path to the application's sstartagentsession.jsp's full path. This path would be available
        	* only in cases when the self-service session is launched from the agent console. In case agent is logged out,
        	* this unauthorized callback would be triggered, it will check if REDIR_URL is provided and redirect to that JSP,
        	* which would start a new session and redirect back to the self-service portal
            */
        	var redirAgentUrl = window.app.getQs('REDIR_URL');
        	if(redirAgentUrl)
        	{
                document.URL = redirAgentUrl + "&portalUrl="+encodeURIComponent(document.URL)+"&selfUrl="+encodeURIComponent(redirAgentUrl);
        	}
        	// remove the stored session Id as we need to restart the session
            this._removeSessionId();
            
            // clear all caches
            window.app.clearCache();

        	// no need to navigate to the login page if we are already on one of login-type pages
            if(loginPagesArray.indexOf(currentPageUrl) != -1)
                return;
            
            // if it's an unauthenticated _customer_ portal, check the error message 
            if(!window.app.isAgentPortal() && !window.app.getPortalSetting('isAuthenticated')) {

            	var serverResponseText = JSON.parse(data.responseText);
            	var serverErrorMsg = serverResponseText.callInfo.message;
            	
            	// if the user hit the max license consumption limit, show 'server busy' message
            	if (serverErrorMsg.indexOf("License not assigned") != -1) 
            		window.app.showErrorPage(window.app.language.getString('SERVER_BUSY'));
            	else // otherwise, just reload the window, which will start a new unauthenticated session
            		window.location.reload();
            	
                return;
            }

            //Navigate to login page
            var nextPagePath = window.location.hash.substr(1);
            // encode this path in case there are query string parameters in it
            nextPagePath = encodeURIComponent(nextPagePath);

            window.app.navigate(window.app.getPageUrl(loginPage) + 
            	'?next=' + nextPagePath, {trigger:true});
        },

        _captureSessionId : function(jqXHR) {
            
            //get the session id
            var session_id = jqXHR.getResponseHeader('x-egain-session');
            
            //Set session Id if we don't have any set on the cookie yet.
            if(session_id && !this._getSessionId()) {
                this._setSessionId(session_id);
            }
        },

        _removeSessionId : function() {

            $.cookie('sessionId', null);
            window.app.sessionId = null;
        },

        _generateCompleteUrl : function(url) {
            
            return window.app.getDeployConfigKey('baseApi') + url;
        }
    });

    return Model;
});
