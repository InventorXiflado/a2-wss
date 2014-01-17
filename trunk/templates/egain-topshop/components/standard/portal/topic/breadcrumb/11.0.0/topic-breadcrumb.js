define(['core/component'], function(CoreComponent) {

    var TopicBreadcrumbComponent = CoreComponent.extend({

        name : 'topic-breadcrumb',

        events : {

            'mouseover li' : '_onTopicRowHover',
            'mouseleave li' : '_onTopicRowLeave',
            'click a': '_onTopicClick'
        },

        prepare : function() {
            
            this.topicModel = this.getModel('topic');
            this.topicId = this.getProperty('topicId');

            this.topicModel.getParentTopics({

                success : this._onParentTopicsArrive,
                context : this,
                topicId : this.topicId
            });

            this.topicModel.getTopic({

                topicId : this.topicId,
                context : this,
                success : this._onTopicArrive
            });
        },

        _onParentTopicsArrive : function(parentTopics) {
            
            this.parentTopics = parentTopics;

            if(this.topic && this.parentTopics) { 

                this.render({
                    
                    parentTopics : this.parentTopics,
                    topic : this.topic
                });
            }
        },

        _onTopicArrive : function(topic) {

            this.topic = topic;

            console.log('topic arrive', topic);

            if(this.topic && this.parentTopics) { 

                this.render({
                    
                    parentTopics : this.parentTopics,
                    topic : this.topic
                });
            }
        },

        _onTopicRowHover : function(e) {
            
            var $li = $(e.target);
            var $childUl = $li.children('ul');

            $childUl.show();
        },

        _onTopicRowLeave : function(e) {
            
            var $li = $(e.target);
            var $childUl = $li.children('ul');

            $childUl.hide();
        },

        _onTopicClick : function(e) {
            this.saveState('topicViewContext', 'topic_tree_click_topic', true);
        },

        buildUrl : function(topic) {

            return this.app.getPageUrl('topic', topic.id, this.slugify(topic.name));
        }
    });

    return TopicBreadcrumbComponent; 
});
