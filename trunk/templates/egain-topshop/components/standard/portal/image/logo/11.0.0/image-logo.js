define(['core/component'], function(BaseComponent){

    var ImageLogoComponent = BaseComponent.extend({
        
        name : "image-logo",

        prepare : function() {

            this.render();
        }
    });

    return ImageLogoComponent;
});
