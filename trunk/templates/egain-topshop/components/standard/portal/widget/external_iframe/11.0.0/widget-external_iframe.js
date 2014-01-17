 define(['core/component'], function(CoreComponent) {

    var WidgetExternalIframeComponent = CoreComponent.extend({

        name : 'widget-external_iframe',

        prepare : function() {

            this._externalUrl = this.getProperty('external_url');

            this.render({externalUrl:this._externalUrl});
        }
    });

    return WidgetExternalIframeComponent; 
});
