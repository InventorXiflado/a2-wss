 define(['core/component'], function(CoreComponent){

    var SearchTopic_filterComponent = CoreComponent.extend({

        name : 'search-topic_filter',

        prepare : function() {

            this.render();
        }
    });

    return SearchTopic_filterComponent; 
});
