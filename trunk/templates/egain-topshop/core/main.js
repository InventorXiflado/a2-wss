//Apply the basic configuration.
require.config({

    baseUrl : "/selfservice",
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

$(function() {

    //Load the core application module.
    require(['core/app'], function(app){

        //Start the application when it's ready.
        app.bind('ready', app.start, app);

        /*
        app.bind('ready', function() {

            app.start({

                mode : 'component',

                config : {

                    name : 'widget-testing',
                    path : 'testing'
                }
            });

        }, app);
        */
    });
});
