define(['underscore',
        'backbone',
        'less',
        'core/manifest',
        'core/page',
        'core/socket',
        'core/cache',
        'core/language',
        'core/helpers'],

function(_,
         Backbone,
         less,
         Manifest,
         Page,
         Socket,
         Cache,
         Language,
         helpers) {

    //Self-Service Application Class
    //------------------------------
    var SelfServiceApp = Backbone.Model.extend({

        initialize : function(){

			$("body").prepend($("<div/>").attr("id", "overlay").css({height:'100%',width: '100%',backgroundColor: 'white', position: 'absolute', zIndex: '99999'}));
			setTimeout("$('#overlay').fadeOut('fast', function(){$(this).remove()})", 2000);

           //Create a router instance.
            this.router = new Backbone.Router();

            //Save the manifest object.
            this.manifest = new Manifest(this);

            //Initialize the cache object
            //responsible for caching cacheable component and section elements.
            this.cache = new Cache();

            //Put the session model instance into the app object.
            //this.session = new Session();

            //Put the language instance into the app object.
            this.language = new Language();

            //Socket is a cross domain messaging object
            //(mostly to communicate to parent page if it's part of an iframe).
            this.socket = new Socket();

            //Start xdm-related listeners
            this._startBodySizePolling();
            this._startHashChangeListener();

            console.log('App Configuration : ', this.manifest.attributes);

            //Array that is used to store all baseUrl arguments.
            this.BASE_ARGUMENTS = [];
            this.PORTAL_SETTINGS = {};
            this.PORTAL_INFO = {};
            this.qs = {};
            this.IS_AGENT = false;

            //Stores all the model references.
            this._models = {};
        },

        /**

            Starts the loading process of the app.

            What we do is basically loading the manifest file first, because
            that's what we need to know what to load next.

            After the application is loaded (which is basically after the
            manifest file is loaded), then the 'ready' event of the app
            will be fired. Usually what we do is to bind the start
            function to the 'ready' event, so we can start the application
            directly after having the manifest file.

            You can pass it an options object.

            {
                "startOnReady" : true,
                "config" : {}
            }

        **/
        load : function(options) {

            options = options || {};

            //If startOnReady is passed, then we just directly start
            //the application when it's ready.
            if(options.startOnReady === true) {

                this.bind('ready', this.start, this);
            }


            //If the deployConfig object is present and it's an object,
            //let's assume that it's the config.
            if(_.isObject(options.deployConfig)) {

                this.setDeployConfig(options.deployConfig);

                //Store the baseUrl on the window object.
                window.baseUrl = this.getDeployConfigKey('baseUrl');
            }

            //Start loading the manifest.
            this.manifest.bind('load', this._onManifestLoad, this);
            this.manifest.load();
        },

        /**

            This function will be called when the manifest file is already
            loaded.

        **/
        _onManifestLoad : function() {

            //Parse the pages manifest files.
            this.applyManifest();

            //Loads the theme, and apply it to the page.
            this.loadTheme();

            //Trigger the app to be ready.
            this.trigger('ready');
        },

        //Start the application.
        start : function() {

            this.IS_AGENT = this.isAgentPortal();
            //Save the portalId.
            //this.portalId = this.getPortalId();

            //Start the hashchange event listener,
            //(and basically the whole application).
            if(!Backbone.history.start()) {

                //We have to load the portal config manually
                this.loadPortalConfig();

                if(this.portalConfigWasLoaded) {

                    this.showErrorPage();

                } else {

                    this.on('portal-config-load', this.showErrorPage, this);
                }
            }
        },

        //Parse configuration files (pages, etc.) and creates
        //the controller function for each of the routes.
        applyManifest : function() {

            var pageManifests = this.manifest.get('pages');
            var _this = this;

            //Load the models first.
            this.loadModels();

            //Catch all handler within baseurl
            this.router.route(this.getBaseUrl() + '/' + '*path', '404', _.bind(function() {

                //Parse base arguments
                this.BASE_ARGUMENTS = this._extractBaseArguments(arguments);

                _this.showErrorPage();

            }, this));

            //Catch all handler outside baseurls
            this.router.route('.*', '404-ext', function() {

                _this.showErrorPage();
            });

            //IE hack
            this.router.route('', 'home', function() {

                if(_this.getCompiledBaseUrl() != '') {

                    _this.router.navigate(_this.getCompiledBaseUrl(), {trigger:true});
                }
            });

            //Go through each page, and
            //attach a controller for each of the pages.
            for(var i in pageManifests){

                var pageManifest = pageManifests[i];

                //alert(JSON.stringify(pageManifest));

                if(!pageManifest.url)
                    continue;

                var url = pageManifest.url;

                //If the page starts with a slash, then take out the slash
                if(url.length > 1 && url[0] == '/') {

                    url = _.rest(url).join('');

                } else if(url == '/') {

                    //If the page is only slash, then change the url to
                    //an empty string.
                    url = '';
                }

                //Check first whether we are in agent portal or not by checking if
                //agentBaseUrl project variable exists. If it exists, then we check the current url
                //if the agentBaseUrl pattern exists in the url. If it does, then we declare the current
                //portal as an agent portal. If it doesn't then we just get the regular baseUrl.



                //If there is specified base url, then we have to
                //prepend the base url to every route
                if(this.getBaseUrl()) {

                    var base_url = this.getBaseUrl();

                    if(url) {

                        url = base_url + '/' + url;

                    } else {

                        url = base_url;
                    }
                }

                //Route the applications router.
                this.router.route(url,
                                  pageManifest.name,
                                  this.buildController(pageManifest));

                //Create trailing comma redirection controller.
                this.router.route(url + '/', pageManifest.name + '-redirect', function() {

                    var currentUrl = window.location.hash.substr(1);
                    //forward to the real url
                    _this.router.navigate(currentUrl.substr(0, currentUrl.length-1), {trigger:true});
                });

            }
        },


        loadModels : function() {

            var modelManifests = this.manifest.get('models');

            for(var i in modelManifests) {

                var modelManifest = modelManifests[i];

                modelManifest.path && this._loadModel(modelManifest);
            }
        },

        _loadModel : function(modelManifest) {

            //window.modelManifest = modelManifest;
            //alert(JSON.stringify(modelManifest));

            var modelPaths = modelManifest.path.split('.');
            var modelName = modelPaths[modelPaths.length-1];
            //Replace the path attribute of the manifest into actual url.
            var modelUrl = modelManifest.path.replace(/\./g, '/') + '/' + modelManifest.version + '/' + modelName;

            //Load the models
            require(['models/' + modelUrl], _.bind(function(modelClass) {

                var model = new modelClass();

                model.setProperties(modelManifest.properties);
                model.setModelPath(modelManifest.path);
				model.id = modelManifest.id; //Set the id to the model

                this._models[modelManifest.id] = model;

            }, this));
        },

        getModelById : function(modelId) {

            return this._models[modelId];
        },

        /** Gets the base url pattern stored in the manifest file, e.g. 'portal/:id'.
         * The pattern depends on whether it's an agent or a customer portal.
         *
         * For backwards compatibility of the changes that enabled crawler friendliness
         * in SS portals, we are allowing '!' in portal URLs even if it's not declared
         * in the base url pattern stored in the manifest file.
         *
         * (Note: '#!' symbols present in the Url of an ajax web application, signal to
         * crawlers that the site is crawler friendly.)
         */
        getBaseUrl : function() {

            // check if '!' is present in the actual portal Url
        	var baseUrl, hasBang = window.location.hash.indexOf("!") == 1;
            if(this.isAgentPortal()) {

                //Default is an empty string.
            	baseUrl = this.manifest.getProjectVar('agentBaseUrl');

            } else {

                //Default is an empty string.
            	baseUrl = this.manifest.getProjectVar('baseUrl');
            }
            // We need to make sure that returned baseUrl matches the pattern of current document URL
            if (hasBang && baseUrl.charAt(0) != "!")
                baseUrl = "!" + baseUrl;
            else if (!hasBang && baseUrl.charAt(0) == "!")
                baseUrl = baseUrl.substring(1);

            return baseUrl;
        },


        //This function extracts the base arguments from the url.
        _extractBaseArguments : function(args) {

            var baseUrl = this.getBaseUrl();

            if(!baseUrl)
                return [];

            var basePaths = baseUrl.split('/');
            var argsCount = 0;

            //what we're doing is basically counting how many
            //dynamic parts are in the base url, and the extracting the
            //same exact amount from the actual argument list.
            _.each(basePaths, function(path, index) {

                if(path.indexOf(':') == 0)
                    argsCount++;

            }, this);

            return _.first(args, argsCount);
        },

        //This function extracts the page arguments from the url.
        _extractPageArguments : function(args) {

            //TODO : should be dynamic, because the base can contain
            //more than 1 dynamic part.
            var args = _.rest(args) || [];

            //if it only includes the object of qs, then ignore it.
            if(args.length == 1)
                return [];

            //If the argument is an object, it means it's the query string
            //object, and just pop it out
            if(_.isObject(args[args.length - 1])) {

                args.pop();
            }

            return args;
        },

        _extractPageQueryString : function(args) {

            var _qs = {};

            //Query string in the arguments.
            for(var i = 0; i < args.length; i++) {

                //The first object in the arguments array
                //is the qs (query string).
                if(_.isObject(args[i])) {

                    var qs = args[i];

                    //TODO : remove qs object.
                    this.qs = qs;
                    this.QS = qs;
                    _qs = qs;

                    //this.page.setQueryString(qs);

                    break;
                }
            }

            return _qs;
        },

        buildController : function(pageManifest){

            var app = this;

            //Create a new page, passing the page json object inside.
            return _.bind(function() {

                //Parse base arguments
                this.BASE_ARGUMENTS = this._extractBaseArguments(arguments);

                var pageArguments = this._extractPageArguments(arguments);
                var pageQueryString = this._extractPageQueryString(arguments);

                this.loadPage(pageManifest, pageArguments, pageQueryString);

                //For IE7&8 : saving the current page in history
                if(window.location.hash.length > 0) {

                    this.router.navigate(window.location.hash.substr(1));

                } else {

                    this.router.navigate('/');
                }

                //If we shouldn't load portal config, then load the language directly.
                if(this.manifest.getProjectVar('shouldLoadPortalConfig') == false) {

                    this.loadLanguage();

                } else {

                    //If we should, then load it.
                    this.portalConfigWasLoading || this.loadPortalConfig();
                }


            }, this);
        },

        loadPage : function(pageManifest, pageArguments, pageQueryString, pageInitVar) {

            //Create the new page instance.
            this.page = new Page(pageManifest, undefined, pageArguments, pageQueryString, pageInitVar);

            this.page.bind('ready', function(){

                app.trigger('page-change');

            }, this);
        },

        loadTheme : function() {

            var themeName = this.manifest.get('theme');

            require([helpers.generateThemePath(themeName)],
                    _.bind(this._onThemeArrive, this));
        },

        _onThemeArrive : function(theme) {

            var _this = this;

            //Compile the theme (a LESS file) to CSS.
            var lessCompiledTheme = (new (less.Parser)).parse(theme, function(err, tree) {

                helpers.applyStyle(tree.toCSS(), document, 'theme-style');

                $('body').attr('data-theme', _this.manifest.get('theme'));
            });
        },

        /**

            We need to continously poll for the body size because
            we support the application to be included within an iframe, which
            doesn't change its size when the size of its contents changes.

            So what we're doing is we poll for the contents size change. When
            it changes, we send a message to the SelfService bootstrapper
            which stays in the parent page, and tell it to manually change
            the iframe size.

        **/
        _startBodySizePolling : function() {

            var $body = $("body");
            var height = $body.outerHeight();
            var _this = this;

            setInterval(function() {

               var new_height = $body.outerHeight();

               if(new_height != height) {

                    _this.socket.send("height-change", new_height + 100); //100 is height cushion

                    height = new_height;
                }

            }, 500);
        },

        _startHashChangeListener : function() {

            this.router.on('all', function() {

                try {

                    //Send message to the socket every hash change.
                    this.socket.send('hash-change', window.location.hash);

                } catch(e) {

                }

            }, this);
        },

        getPortalId : function() {

            //TODO : remove
            var value = this.manifest.getProjectVar('portalId');

            return value;
        },

        getQs : function(key) {

            if(this.qs) {

                return this.qs[key];
            }
        },

        changeTheme : function(theme_name) {

            require([helpers.generateThemePath(theme_name)],
            function(theme_content) {

                helpers.removeThemeStyle();
                helpers.applyStyle(theme_content, document, 'theme-style');
            });
        },

        /**

            this._articleModel = this.getModel('article', '1.1.0');
            this._articleModel.load({});

        **/
        getModel : function() {


        },

        /**



        **/
        setDeployConfig : function(deployConfig) {

            this._deployConfig = deployConfig;
        },

        getDeployConfigKey : function(key) {

            return this._deployConfig[key];
        },

        getCurrentUrl : function() {

            return window.location.hash.split('?')[0];
        },

        /**

            Gets another page's URL.

            Ex : app.getPageUrl('article', 1001);

        **/
        getPageUrl : function(pageName) {

            var pageManifest = this.manifest.getPageManifest(pageName);

            //TODO : we have to compile dynamic urls
            if(pageManifest) {

                //If the url is just slash (/),
                //then we have to replace with empty string.
                var pageUrl;

                if(pageManifest.url == '/') {

                    pageUrl = '';

                } else {

                    var _passedArgs = [pageManifest.url].concat(_.rest(arguments));

                    pageUrl = this.compileUrl.apply(this, _passedArgs);
                }

            } else {

                var pageUrl = '';
            }

            //Append the baseUrl to pageUrl
            if(pageUrl) {

                //Append it with the baseUrl.
                var completeUrl = this.getCompiledBaseUrl() + '/' + pageUrl;

            } else {

                //Append it with the baseUrl.
                var completeUrl = this.getCompiledBaseUrl();
            }

            /* Check if there are any query string keys that are supposed to be persisted throughout the
             * portal (added to each page url in the portal).
             * e.g. If the portal manifest contains a line
             * "persistentQueryStringKeys" : ["UAC_CMD"],
             * and the portal was launched through a url that contains 'UAC_CMD=yes' in the query string,
             * then the url of each page the user will navigate to, has to contain 'UAC_CMD=yes' in its query string.
             */
            var persistentVarsArray = this.manifest.getProjectVar('persistentQueryStringKeys') || [] ;
            if(persistentVarsArray.length) { // if any persistent variables are specified in the manifest

            	// an object to store key/value pairs of existing persistent variables
            	var queryObject = {};

            	// iterate over all persistent variables specified in the manifest, and check
            	// if any of them are present in the query string of the current page's url
            	for (var i = 0; i < persistentVarsArray.length; i++) {
            		var value = this.page.getQueryString(persistentVarsArray[i]);
            		if(value)
            			queryObject[persistentVarsArray[i]] = value;
            	}

            	// now add all the found persistent variables to the query string of
            	// the page url we are building.
            	if (!$.isEmptyObject(queryObject))
            		completeUrl = this.addQueryStrParamsToUrl(completeUrl, queryObject);
            }

            return '#' + completeUrl;
        },

        getCompiledBaseUrl : function() {

            //TODO : should be the actual current baseUrl
            // instead of always portalId
            return this.compileUrl(this.getBaseUrl(), this.getPortalId());
        },

        compileUrl : function(url) {

            //first argument is the actual url string, the rest
            //are the actual arguments.
            //if the last argument is an object, then
            //interpret that as the query string.
            var args = _.rest(arguments);
            var argIndex = 0;
            var compiledUrl = '';
            var paths = url.split('/');
            var queryString = {};


            //If the last argument is an object, then lets take that
            //out of the argument array and make it the query string object.
            if(_.isObject(_.last(arguments))) {

                queryString = args.pop();
            }

            //Let's compile each of the path.
            var compiledUrl = _.map(paths, function(path, index) {

                //If path starts with ':' or '*', then it's a dynamic path.
                if(path.indexOf(':') == 0 || path.indexOf('*') == 0)
                    return args[argIndex++];
                else
                    return path;

            }).join('/');

            if(_.keys(queryString).length > 0) {

                compiledUrl = this.addQueryStrParamsToUrl(compiledUrl, queryString);
            }

            return compiledUrl;
        },

        /** Adds query string key/values passed in 'queryObject' to the given url.
         *
         * example 1:
         *   url: http://localhost/templates/selfservice/sunburst/#portal/1000
         *   queryObject = { language : en, country : us, brand : [samsung, GE, toshiba }
         *
         *   output url:
         *   http://localhost/templates/selfservice/sunburst/#portal/1000?language=en&country=us&brand=samsung&brand=GE&brand=toshiba
         *
         * example 2:
         *   url: http://localhost/templates/selfservice/sunburst/#portal/1000?userName=Jon
         *   queryObject = { language : en, country : us }
         *
         *   output url: http://localhost/templates/selfservice/sunburst/#portal/1000?userName=Jon&language=en&country=us
         */
        addQueryStrParamsToUrl : function(url, queryObject) {

        	url += (url.indexOf('?') != -1) ? '&' : '?';

        	for(var key in queryObject) {

                var value = queryObject[key];
                    if(_.isString(value) || _.isNumber(value)) {

                	url += (key + '=' + value + '&');
                    }
                    else if(_.isArray(value)) {

                    	for (var i = 0; i < value.length; i++) {
               			url += (key + '=' + value[i] + '&');
                    }
                }
            }

            // remove the last ampersand we added
            if(url.charAt(url.length - 1) == '&')
            	url = url.slice(0, -1);

            return url;
        },

        navigate : function(url, options) {

            this.router.navigate(url, options);
        },

        navigateToPage : function(pageName) {

            var url = this.getPageUrl
                          .apply(this, [pageName].concat(_.rest(arguments)));

            if(!url)
                return;

            //Navigate to the actual url.
            this.navigate(url, {trigger:true});
        },

        /**
         *
         * Loads the portal config.
         *
         */
        loadPortalConfig : function( ) {

            if(this.manifest.getProjectVar('shouldLoadPortalConfig') == false) {

                return;
            }

            var portalId = this.getPortalId();
            var baseApiUrl = this.manifest.compileValue(this.manifest.getProjectVar('portalConfigBaseUrl'));

            $.ajax({

                url : baseApiUrl + '/general/portal/' + portalId,
                success : this._onPortalConfigLoaded,
                dataType : 'json',
                error : this._onPortalConfigError,
                context : this,
                headers : {'x-egain-sso-session' : this._getSSORequestId()},
                complete : function(jqXHR,textStatus) {
                    this.setSSOSessionId(jqXHR.getResponseHeader('x-egain-session'));
                }
            });

            this.portalConfigWasLoading = true;
        },

        ssoSessionId : null,

        setSSOSessionId: function(ssoSessionId) {
            this.ssoSessionId = ssoSessionId;
        },

        getSSOSessionId: function() {
            return this.ssoSessionId;
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

        _onPortalConfigLoaded : function(data) {

            if(_.isString(data)) {

                data = JSON.parse(data);
            }

            this.PORTAL_INFO = data.portal[0];
            this.PORTAL_SETTINGS = this.PORTAL_INFO.portalSettings;

            // Set the meta description tag in the header with portal's description as content
            helpers.createOrUpdateMetaTag('description', this.PORTAL_INFO.description);

            this.loadLanguage();

            this.portalConfigWasLoaded = true;

            this.trigger('portal-config-load');
        },

        _onPortalConfigError : function() {

            this.showErrorPage();
        },

        loadLanguage : function() {

            if(this.language.isReady) {

                return;
            }

            if (this.manifest.get('isPortal')) {
            	var lang = this.manifest.compileValue(this.manifest.get('language'));
            }
            else {
            	var manifestLangCode = this.manifest.compileValue(this.manifest.get('languageCode'));
            	var manifestCountryCode = this.manifest.compileValue(this.manifest.get('countryCode'));

	           	if (manifestLangCode && manifestCountryCode) {
            		var lang = manifestLangCode.toLowerCase() + '-' + manifestCountryCode.toUpperCase();
            	}
            }

            //Load the language files.
            this.language.load(lang, this.manifest.get('isCustomLangFilePresent'));
        },

        getPortalSetting : function(settingKey, defaultValue) {

            var settingValue = this.PORTAL_SETTINGS[settingKey];

            if (typeof settingValue === 'undefined') {

            	return defaultValue;
            }
            else {
            	return settingValue;
            }
        },

        getPortalInfo : function(settingKey, defaultValue) {

            var settingValue = this.PORTAL_INFO[settingKey];

            if (typeof settingValue === 'undefined') {

            	return defaultValue;

            } else {
            	return settingValue;
            }
        },

        isAgentPortal : function() {

            return window.location.hash.indexOf('agent/portal') != -1 || this.IS_AGENT;
        },

        /**
         * Checks if the value entered is valid for the given fieldType
         */
        validateEntry : function(fieldValue, fieldType) {

	     switch(fieldType) {

	        case 'emailaddress' : 	var valid = true;
	        			//Check if the email address entered is valid.
	        		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\ ".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA -Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					valid =  re.test(fieldValue);
					return valid;

			case 'date' :	var valid = true;
					var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;	//Check if the date format is correct
					valid = re.test(fieldValue);

					var dateBits = fieldValue.split('/');
					var dateObj = new Date(dateBits[2], dateBits[1] - 1, dateBits[0]);
					var currentDate = new Date();
					//check if the date is valid and after year 1900 and before current date.
  					valid = dateObj && (dateObj.getMonth() + 1) == dateBits[1] && dateObj.getDate() == Number(dateBits[0]) && (dateObj < currentDate) && (dateObj.getFullYear() > 1900) ;
					return valid;
			}
        },

        /**
         * Shows the error page either with the provided message or the default message
         * pulled from the language file.
         */
        showErrorPage : function(errorMessage) {

        	var errorPageName = this.manifest.getProjectVar('errorPage') || 'error';

        	/* If the error message is provided, it'll be used. Otherwise, check if the language file
        	 * is loaded; and if so, pull the default message from it. */
        	if(errorMessage || this.language.isReady) {
        		var message = errorMessage ? errorMessage : this.language.getString('INVALID_URL');
        		this.loadPage(this.manifest.getPageManifest(errorPageName), null, null, { 'error_message' : message });
        	}
        	/* If the language file is not loaded yet, wait for it to load and call this method again
        	 * to display the default message. */
        	else {
        		this.language.bind('ready', this.showErrorPage, this);
            	this.loadLanguage();
        	}
        },

        setCookie : function(key, value) {

            $.cookie(key, value);
        },

        getCookie : function(key) {

            return $.cookie(key);
        },

        removeCookie : function(key) {

            $.cookie(key, null);
        },

        /**
         * Enables callers to save JSONifyable values in the browser.
         *
         *  Example :
         *  this.saveInBrowser('some-key', [1001, 1002, 1003], true);
         *  this.saveInBrowser('some-key', {'data' : 'tv'}, false, 'standard.portal.search.results');
         */
        saveInBrowser : function(key, value, isGlobal, componentOrModelName) {

            // prepend portal ID to every stored value
        	var portalIdStr = 'portalId_' + this.getPortalId() + ':';

            if(isGlobal) { // add 'global' indicator so any component or model can retrieve it
            	amplify.store(portalIdStr + 'global' + ':' + key, value);
            }
            else { // prepend component or model name to the key so only this component/model will be using this data
            	amplify.store(portalIdStr + componentOrModelName + ':' + key, value);
            }
        },

        /**
         * Enables caller to retrieve values that were stored via saveInBrowser().
         *
         * Example :
         * var value = this.getSavedValue('some-key', null, true);
         * var value = this.getSavedValue('some-key', {}, false, 'standard.portal.search.results');
         */
        getSavedValue : function(key, default_value, isGlobal, componentOrModelName) {

        	// compose portal ID string
        	var portalIdStr = 'portalId_' + this.getPortalId() + ':';

        	if(isGlobal) { // retrieve a global value
        		return amplify.store(portalIdStr + 'global' + ':' + key) || default_value;
        	}
        	else { // retrieve a component/model specific value
        		return amplify.store(portalIdStr + componentOrModelName + ':' + key) || default_value;
        	}
        },

        /**This function takes a date object and converts it into a format accepted by the WS API.
         * The UTC time and date is used to create the date string and the offset is set to 0.
         * The format dd MMM yyyy HH:mm:ss.SSS Z is accepted by the WS API.
         * Example : 01 Jan 2000 05:00:00.000 -0000 is accepted by the WS.
         */
	parseDateObj : function(dateObj) {

		var year = dateObj.getUTCFullYear();
		var date = dateObj.getUTCDate();
		if(date < 10)
			date = '0' + date;
		var month = dateObj.getUTCMonth();
		var monthArr = new Array( "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		var monthFormatted = monthArr[month];
		var hour = dateObj.getUTCHours();
		var minutes = dateObj.getUTCMinutes();
		var seconds = dateObj.getUTCSeconds();
		var milliseconds = dateObj.getUTCMilliseconds();
		var acceptableDateTime = date + ' ' + monthFormatted + ' ' + year + ' ' + hour + ':' + minutes + ':' + seconds + '.' + milliseconds + ' -0000';
		return acceptableDateTime;
	},

        /**This function takes the date in the server format and returns date object
         * The format dd MMM yyyy HH:mm:ss.SSS Z is the format in which the server returns date.
         * It has been assumed that always UTC date will be returned from the server.
         * Example : 01 Jan 2000 05:00:00.000 +0000.
         */
	parseServerDate : function(serverDate) {

		var dateTimeBits = serverDate.split(" ");
		var timeBits = dateTimeBits[3].split(":");
		var monthArr = new Array( "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		var year = dateTimeBits[2];
		var month = monthArr.indexOf( dateTimeBits[1] );
		var day = dateTimeBits[0];
		var hour = timeBits[0];
		var minutes = timeBits[1];
		var seconds = (timeBits[2].split("."))[0];
		var milliseconds = (timeBits[2].split("."))[1];

		return new Date(Date.UTC(year, month, day, hour, minutes, seconds, milliseconds));
		},

        /**
         * Clears cache for the app. Relevant for caching sections and components.
         */
        clearCache : function() {
            this.cache = new Cache();
        }
    });

    //Return an instantiation of the SelfServiceApp. Yes, it is a singleton.
    return (window.app = new SelfServiceApp());
});
