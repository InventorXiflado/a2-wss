 define(['core/component'], function(CoreComponent){

    var WidgetExternalImageComponent = CoreComponent.extend({

        name : 'widget-external_image',

        prepare : function() {
            
            var externalUrl = this.getProperty('externalUrl');
            var imageUrl = this.getProperty('imageUrl');

            this.render({

                externalUrl:externalUrl,
                imageUrl:imageUrl
            });
        }
    });

    return WidgetExternalImageComponent; 
});
    
    
