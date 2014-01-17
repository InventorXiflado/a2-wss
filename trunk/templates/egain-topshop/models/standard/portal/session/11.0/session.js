define(['core/model'], function(Model){
    
    var Session = Model.extend({
        
        initialize : function() {

            this.id = $.cookie('sessionId');
        },
        
        /**

            Ex: 

            var session = new Session();

            session.isLoggedIn

        **/
        isLoggedIn : function(params) {

            this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/dfaq',
                success_codes : [201],
                error_codes : [401],
                success : function() {

                    params.success.call(params.context);
                },

                error : function() {
                    
                    params.error.call(params.context);
                }
            });
        },

        login : function(params) {
            
            this._removeSessionId(); // At this point there is no need for any dangling session ID. API will create a new session.
            this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/ss/authenticate/login',
                data : params.data,
                context : this,
                type : 'json',
                success_codes : [201],
                error_codes : [401],
                
                success : function(data, textStatus, jqXHR) {
            		data.username = params.data.username;
            		params.success.call(params.context, data, textStatus, jqXHR);
                },

                error : function(data) {
                	params.error.call(params.context, data);
                }
            });
        },

        logout : function(params) {

        	this.makeRequest({
                
                method : 'POST',
                url : this.getProperty('baseUrl') + '/ss/authenticate/logout',
                success_codes : [201],
                error_codes : [400, 401, 404],
                type : 'json',
                
                success : function() {
        			params.success.call(params.context);
                },

                error : function() {
                    params.error.call(params.context);
                }
            });
        },

        loginGH : function(params) {

            this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/gh/session/login',
                success_codes : [201],
                error_codes : [401],
                success : function() {
                    
                    if(params)
                        params.success.call(params.context);
                },

                error : function() {
                    params.error.call(params.context);
                }
            });
        },

        terminate : function(){
            
            if(!window.app.session_id)
                return;

            this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/ss/authenticate/terminateSession/' + window.app.session_id,
                success: function() {

                    
                },

                error : function() {


                }
            });
        }
    });

    return Session;
});
