define(['core/component'], function(CoreComponent) {

    var TopicMenuFlyoutComponent = CoreComponent.extend({

        name : 'topic-menu_flyout',

        events : {
            'mouseenter li' : '_onTopicRowHover',
            'mouseleave li' : '_onTopicRowLeave',
            'click li': '_onTopicClick'
        },

        prepare : function() {
            
            this.topicModel = this.getModel('topic');
            this.topicModel.getAllTopics({
                success : this._onTopicsArrive,
                context : this
            });
        },

        _onTopicsArrive : function(data) {
            
            var _this = this;
            this.render({
                
                topics : data.topics
            });
        },

        _onTopicRowHover : function(e) {
            this.$(e.currentTarget).children('ul.egce-child-list').show();
        },

        _onTopicRowLeave : function(e) {
            this.$(e.currentTarget).children('ul.egce-child-list').hide();
        },

        _onTopicClick : function(e) {
            this.$('ul.egce-child-list').hide();
            this.saveState('topicViewContext', 'topic_tree_click_topic', true);
        },

        buildUrl : function(topic) {
            return this.app.getPageUrl(this.getProperty('topic_page') || 'topic', topic.id,
                                       this.slugify(topic.name));
        },
        
        /* If a section is cached, it will call this method on the component while using the cached copy */
        useCachedCopy : function() {
            // When cached copy is used, the hover state can stay in IE browsers. We are cloning the element to get rid of any hover styles.
        	var _el = this.$el.clone();
        	this.$el.empty().append(_el);
        	this.delegateEvents();
        }
    });

    return TopicMenuFlyoutComponent; 
});
