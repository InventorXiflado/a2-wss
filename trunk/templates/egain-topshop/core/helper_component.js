define(['backbone', 'handlebars'], function(Backbone, Handlebars) {
    
    var HelperComponent = Backbone.View.extend({
        
        compile : function(html, data) {
            
            return Handlebars.compile(html)(data);
        }
    });

    return HelperComponent;
});
