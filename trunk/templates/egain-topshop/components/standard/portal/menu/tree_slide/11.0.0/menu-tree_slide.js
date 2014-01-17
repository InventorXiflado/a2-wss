 define(['core/component', 'core/models/topic'], function(CoreComponent, Topic){

    var MenuTreeSlideComponent = CoreComponent.extend({

        name : 'menu-tree_slide',

        events : {
            
            /** root level events */
            //'click .level-wrap a' : 'loadChild',
            //'click .previous' : 'loadParent',
            
            /** child level events */
            //'click ul.children a' : 'loadNonRootChildren',
            'click li a.root' : 'loadChildrenOfRoot',
            'click li a.child' : 'loadChildrenOfChild',
            'click li a.breadcrumb-label' : 'loadBreadcrumbLevel'
        },

        prepare : function() {

            this._topicModel = new Topic();

            var root_topics = this._topicModel.getRootTopics({

                success : this._onRootTopicsArrive,
                context : this
            });
        },

        _onRootTopicsArrive : function(data) {

            this.render({topics:data.topics});

            this._cacheTopics(data.topics);
        },

        _cacheTopics : function(topics) {

            _.each(topics, function(topic) {
                
                //cache the topic info
                this.saveState('topic:' + topic.id, topic);

            }, this);
        },

        loadChildrenOfRoot : function(e) {

            e.preventDefault();

            var $a = $(e.target);
            var topicId = $a.attr('data-topic-id');

            this._topicModel.getChildTopics({

                topicId : topicId,
                success : function(data) {
                
                    this._cacheTopics(data.topics);

                    /*
                        We have to save the breadcrumb.
                        
                        breadcrumb = {

        
                            "1000" : [{.. child article object ..},
                                      {.. child article object ..}, 
                                      {.. child article object ..}],

                            "1001" : []
                        }
                    */

                    var breadcrumb = this.getState('breadcrumb', {});
                
                    //initialize the list
                    breadcrumb[topicId] = [this.getState('topic:' + topicId)];

                    this.saveState('breadcrumb', breadcrumb);
                    
                    //Only advance when there are actually children topics.
                    if(data.topics.length) {

                        this._onChildrenTopicsArrive(topicId, topicId, data);

                    } else {

                    }
                },
                context : this
            });
        },

        _onChildrenTopicsArrive : function(topicId, rootTopicId, data) {
            
            var $parentLevelWrap = 
                        this.$('div.level-wrap.root[data-topic-id="'+rootTopicId+'"]');

            console.log('parentLvelWrap', rootTopicId, $parentLevelWrap);
            
            //Render the children level.
            var childLevelHtml = this.compileTemplate('children-level', {
                    
                childrenTopics : data.topics,
                breadcrumb : this._getBreadcrumbString(rootTopicId)
            });

            $parentLevelWrap.html(childLevelHtml);
        },

        loadChildrenOfChild : function(e) {
            
            console.log('load children of child');
            e.preventDefault();

            var $a = $(e.target);
            var topicId = $a.attr('data-topic-id');
            var rootTopicId = $a.parents('div.level-wrap.root:first')
                                .attr('data-topic-id');

            console.log("CHILD TOPIC ID", topicId, rootTopicId);

            this._showLoadingOverlay(rootTopicId);
            
            setTimeout(_.bind(function() {

                this._topicModel.getChildTopics({

                    topicId : topicId,
                    success : function(data) {

                        //Only advance when there are actually children topics.
                        if(data.topics.length == 0)  {
                            
                            this._removeLoadingOverlay(rootTopicId);
                            return;
                        }

                        this._cacheTopics(data.topics);

                        var breadcrumb = this.getState('breadcrumb');
                        var topic = this.getState('topic:' + topicId)

                        breadcrumb[rootTopicId].push(topic);

                        this.saveState('breadcrumb', breadcrumb);
                        
                        this._onChildrenTopicsArrive(topicId, rootTopicId, data);
                    },

                    context : this
                });

            }, this), 600);
        },

        _getBreadcrumbString : function(rootTopicId) {

            var breadcrumbTopicPath = this.getState('breadcrumb')[rootTopicId];
            var string = '';

            _.each(breadcrumbTopicPath, function(topic, index) {

                string += this.compileTemplate('breadcrumb-label', {topic:topic});
                
                if(index < breadcrumbTopicPath.length - 1) {

                    string += ' > ';
                }

            }, this);

            return string;
        },

        loadBreadcrumbLevel : function(e) {
            
            e.preventDefault();

            var $a = $(e.target);
            var topicId = $a.attr('data-topic-id');
            var rootTopicId = $a.parents('div.level-wrap.root:first')
                                .attr('data-topic-id');

            this._showLoadingOverlay(rootTopicId);

            setTimeout(_.bind(function() {
                this._topicModel.getChildTopics({

                    topicId : topicId,

                    success : function(data) {

                        this._removeLoadingOverlay(rootTopicId);

                        this._cacheTopics(data.topics);

                        var breadcrumb = this.getState('breadcrumb');

                        var topic = this.getState('topic:' + topicId);
                        
                        //Go through the breadcrumb path until we find
                        //the targeted topic, and then delete the extra
                        //paths.
                        var breadcrumbPath = breadcrumb[rootTopicId];

                        for(var i = 0, pathIndex = 0;i < breadcrumbPath.length;i++) {

                            if(breadcrumbPath[i].id == topic.id) {

                                pathIndex = i + 1;
                                    
                                break;
                            }
                        }

                        breadcrumb[rootTopicId] = _.first(breadcrumbPath, pathIndex);

                        this.saveState('breadcrumb', breadcrumb);

                        this._onChildrenTopicsArrive(topicId, rootTopicId, data);
                    },

                    context : this
                });

            }, this), 600);
        },

        _showLoadingOverlay : function(rootTopicId) {

            var $levelWrap = this._getLevelWrap(rootTopicId);

            console.log('show loading oberlay', rootTopicId);

            $levelWrap.append(this.compileTemplate('loading-overlay'));
        },

        _getLevelWrap : function(rootTopicId) {

            return this.$('div.level-wrap.root[data-topic-id="' +
                                     rootTopicId +'"]');
        },

        _removeLoadingOverlay : function(rootTopicId) {

            var $levelWrap = this._getLevelWrap(rootTopicId);

            $levelWrap.find('.loading-overlay:first').remove();
        }
    });

    return MenuTreeSlideComponent; 
});
