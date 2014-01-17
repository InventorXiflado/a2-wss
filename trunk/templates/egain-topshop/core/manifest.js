define(['underscore', 'backbone'], 

function(_, Backbone){

    var Manifest = Backbone.Model.extend({

        initialize : function(app) {

            this.app = app;
        
            var pathname = window.location.pathname;

            if(pathname.indexOf("/projects") == 0)
            {
                this.dev_mode = true;
                this.project_id = pathname.split('/projects/')[1];

            } else {

                this.dev_mode = false;
            }
            
            this.dev_mode = true;
        },

        load : function() {
            
            //if the index.html file contains a SELFSERVICE_CONFIG json object
            //variable, then just use that.
            if(window.SELFSERVICE_CONFIG) {

                setTimeout(function() {
                    
                    _this.set(window.SELFSERVICE_CONFIG);
                    _this.trigger('load');

                }, 0);
            
                return;
            }

            //TODO: we should get this from the index.html bootstrap config
            var configUrl = this.app.getDeployConfigKey('manifestUrl');
            
            //In development mode, append nocache.
            if(this.app.getDeployConfigKey("dev") === true) {
                
                configUrl += "?nocache=" + new Date().getTime();
            }

            var _this = this;
            
            //Gets the manifest
            $.get(configUrl, function(config_data) {
                
                //console.log("CONFIG DATA", config_data);
                
                if(!_.isObject(config_data)) {

                    config_data = JSON.parse(config_data);
                }
                _this.set(config_data);
                _this.trigger('load');
            });
        },

        getPageManifest : function(pageName) {
            
            return _.find(this.get('pages'), function(page) {
                
                return page.name == pageName; 
            });
        },

        getSectionManifest : function(sectionName) {


        },

        compileValue : function(value) {

            /**

                POSSIBLE VARIABLES:

                $BASE_ARG --> arguments from the base Url

                Ex : $BASE_ARG:0

                $PAGE_ARG --> arguments from the url
                $PROJECT_VAR --> arguments from the portal variable.
                $QUERY_STRING --> the query string
                $LANG_STRING --> language string
                	Ex: $LANG:GUIDED_HELP
                $PAGE_INIT_VAR --> var to be used at page initialization
                	Ex: $PAGE_INIT_VAR:error_message (passing the error message to error page)

                this.app.manifest.compileValue()

            **/
            
            if(!_.isString(value))
                return value;

            //If it's not a variable, then just return the value.
            if(!value.indexOf('$') == 0) 
                return value;
        
            //URL query string 
            if(value.indexOf('$QUERY_STRING') == 0) {
                
                //Ex : $QUERY_STRING:entrypointId 
                return window.app.page.getQueryString(value.split(':')[1]);

            } else if (value.indexOf('$PAGE_ARG') == 0) {

                var key = value.split(':')[1];
                //Ex : $:entrypointId 
                return window.app.page.getArgument(parseInt(key));

            } else if(value.indexOf('$PAGE-ARGUMENT') == 0) {

                var key = value.split(':')[1];

                //Ex : $:entrypointId 
                return window.app.page.getArgument(parseInt(key));
                
            } else if (value.indexOf('$BASE_ARG') == 0) {

                //Ex : $QUERY_STRING:entrypointId 
                return window.app.BASE_ARGUMENTS[value.split(':')[1]];

            } else if (value.indexOf('$PORTAL_SETTING') == 0) {

                return window.app.getPortalSetting(value.split(':')[1]);
            
            } else if (value.indexOf('$PORTAL_INFO') == 0) {

                return window.app.getPortalInfo(value.split(':')[1]);

            } else if (value.indexOf('$PROJECT_VAR') == 0) {

                return this.getProjectVar(value.split(':')[1]);

            } else if(value.indexOf('$LANG_STRING') == 0) {

                return this.app.language.getString(value.split(':')[1]);
    
            } else if(value.indexOf('$PAGE_INIT_VAR') == 0) {

                return window.app.page.initVar[value.split(':')[1]];
                
            } else {
                
                throw new Error("Invalid manifest variable : ", value);
            } 
        },

        getProjectVar : function(key, defaults) {

            var compiled =  this.compileValue(this.get('projectVars')[key]) ;
            
            if(typeof compiled != 'undefined') {
                
                return compiled;

            } else {
                
                return defaults;
            }
        },

        getPageManifest : function(pageName) { 
            
            return _.find(this.get('pages'), function(page) {

                return page.name == pageName;
            });
        }
    });

    return Manifest;
});
