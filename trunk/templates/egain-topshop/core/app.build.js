({
        
    appDir : "../",
    baseUrl : "./",
    paths : {
        
        "jquery" : "core/libs/js/jquery.min",
        "underscore" : "core/libs/js/underscore-min",
        "backbone" : "core/libs/js/backbone",
        "mustache" : "core/libs/js/mustache",
        "yaml" : "core/libs/js/yaml.min",
        "config" : "core/config",
        "text": "core/libs/js/text"
    },

    dir : "../../selfservice-build",
    modules : [

        {
            //The main module. 
            name : "core/main",
            include : [

                "components/search/results/search-results",
                "components/search/basic/search-basic",
                "components/menu/tree/menu-tree",
                "components/image/logo/image-logo",
            ]
        }
    ]
})
