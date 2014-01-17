(function(window) {

    function SelfService() { }

    SelfService.prototype.deploy = function(deployConfig) {
        
        
        var requireConfig = {

            baseUrl : deployConfig.baseUrl || '/selfservice',

            paths : {

                "jquery" : "core/libs/js/jquery.min.js",
                "underscore" : "core/libs/js/underscore-min",
                "backbone" : "core/libs/js/backbone",
                "mustache" : "core/libs/js/mustache",
                "text": "core/libs/js/text",
                "handlebars" : "core/libs/js/handlebars",
                "amplify" : "core/libs/js/amplify.store",
                "less" : "core/libs/js/less",
				"raty" : "core/libs/js/jquery.raty.min"
            },

            waitSeconds : 15
        };
        
        //On dev mode, then append urlArgs to all module.
        if(deployConfig.dev === true) {

            requireConfig.urlArgs = "nocache=" + (new Date()).getTime();
        }

        //Setup RequireJS' config.
        require.config(requireConfig);
        
        //Require on window ready.
        $(function() {

            require(['core/app'], function(app) {
                 
                //Attach it to the global SelfService app object.
                SelfService.app = app;

                //Load the application.
                app.load({startOnReady:true, deployConfig:deployConfig});
            });
        });
    }
        
    //Use this to manually set a manifest for the application
    //instead of loading by ajax.
    SelfService.setManifest = function(manifest) {}

    //Initialize an instance of SelfService and attach it to the window object.
    window.SelfService = new SelfService();

})(this);
