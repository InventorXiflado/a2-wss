define(['core/component'], function(BaseComponent){

    var BoxSupportComponent = BaseComponent.extend({

        name : "box-support",

        prepare : function() {

            this.render();
        }
    });

    return BoxSupportComponent;
});
