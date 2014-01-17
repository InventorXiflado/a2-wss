 define(['underscore', 'core/component'], function(_, CoreComponent) {

    var ListHighlightedTopicsComponent = CoreComponent.extend({
        
        name : 'list-highlighted_topics',

        prepare : function() {

            this.topicModel = this.getModel('topic');

            this.topicModel.getRootTopics({

                success : this._onTopicsArrive,
                context : this
            });
        },

        _onTopicsArrive : function(topics) {

            //this.render(_.first(topics, this.getProperty('shown_topic_count', 5)));
            var topicCount = this.getProperty('shown_topic_count', 5);
            var shownTopics = _.first(topics.topics, topicCount);

            var data = {
                
                'topics' : shownTopics
            };

            this.render(data);

            //Dynamically size the topic
            this.$('li a').width((this.$el.width() - 1) / topicCount - 1);
        
            //add class 'last' to the last <li>
            //
            $(this.$('li')[shownTopics.length - 1]).addClass('last');
        },

        buildUrl : function(topic) {

            return this.app.getPageUrl('topic', topic.id, this.slugify(topic.name));
        }
    });

    return ListHighlightedTopicsComponent; 
});
