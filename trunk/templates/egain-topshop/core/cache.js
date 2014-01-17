define(['backbone', 'underscore'], function(Backbone, _) {

    var Cache = Backbone.Model.extend({

        initialize : function() {
        
            this._sectionCache = {};
            this._componentCache = {};
        },

        isComponentCached : function(componentId) {
                
            return !!(this._componentCache[componentId]);
        },

        getCachedComponent : function(componentId) {

            return this._componentCache[componentId];
        },

        cacheComponent : function(componentId, component) {

            this._componentCache[componentId] = component;
        },

        isSectionCached : function(sectionId) {
            
            return !!(this._sectionCache[sectionId]);
        },

        getCachedSection : function(sectionId) {

            return this._sectionCache[sectionId];
        },

        cacheSection : function(sectionId, section) {

            this._sectionCache[sectionId] = section;
        }
    });

    return Cache;
});
