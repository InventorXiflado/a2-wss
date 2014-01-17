(function(window) {

    function SelfService() {

         
    }

    SelfService.prototype.boot = function(config) {
        
        //Setup RequireJS' config.
        require.config({

            baseUrl : config.baseUrl || '/selfservice',
            paths : {

                "jquery" : "core/libs/js/jquery.min.js",
                "underscore" : "core/libs/js/underscore-min",
                "backbone" : "core/libs/js/backbone",
                "mustache" : "core/libs/js/mustache",
                "yaml" : "core/libs/js/yaml.min",
                "config" : "core/config",
                "text": "core/libs/js/text",
                "handlebars" : "core/libs/js/handlebars",
                "amplify" : "core/libs/js/amplify.store"
            },
            urlArgs:"nocache=" + (new Date()).getTime(),
            waitSeconds : 15
        });
        
        //Require on window ready.
        $(function() {

            require(['core/app'], function(app) {
                 
                //Attach it to the global SelfService app object.
                SelfService.app = app;

                console.log("APP", window.app.getConfig);
                
                //Start the application when it's ready.
                app.bind('ready', function() {
                    
                    //Pass down the config
                    app.start(config);

                }, app);
            });
        });
    }
        
    //Use this to manually set a manifest for the application
    //instead of loading by ajax.
    SelfService.setManifest = function(manifest) {


    }
    
    window.SelfService = new SelfService();

})(this);
