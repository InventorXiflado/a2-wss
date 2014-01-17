define(['core/component'], function(BaseComponent){

    var C2CLogoComponent = BaseComponent.extend({
        
        name : "image-logo",
        
        events : {
            'click .x-button' : 'onCloseButtonClick'
        },

        prepare : function() {
            this.render();
        },
        
        onCloseButtonClick : function() {
			
			window.open("", "_self", "");
			window.close();
		}
    });

    return C2CLogoComponent;
});
