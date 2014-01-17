define(['underscore', 'core/model'], function(_, Model){

    var Topic = Model.extend({

        getAllTopics : function(params) {

            var _this = this;

            return this.makeRequest({

                method: 'GET',
                url: this.getProperty('baseUrl') + '/ss/topic',
                type : 'json',
                data : {'$level':-1},
                success : function(data) {

                    var _topics = [];

                    //Pass the _topics JS object and the xml object.
                    //_this._buildTopicTree(_topics, $(xml).children('ns7\\:topicTreeResult'));

                    _this._buildTopicTreeFromJson(_topics, data);

                    params.success.call(params.context, {

                        topics : _topics
                    });
                },

                error : function() {

                    params.error.call(params.context);
                }
            });
        },

        _buildTopicTreeFromJson : function(_topics, root) {

            _.each(root.topicTree, function(topicObj) {

                var _topic = topicObj.topic;
                _topic.children = [];

                this._buildTopicTreeFromJson(_topic.children, topicObj);

                _topics.push(_topic);

            }, this);
        },

        getRootTopics : function(params){

            var _this = this;

            return this.makeRequest({

                method: 'GET',
                url: this.getProperty('baseUrl') + '/ss/topic',
                type : 'json',
                data : {'$level':0},
                success : function(data) {

                    var _topics = [];

                    _this._buildTopicTreeFromJson(_topics, data);

                    //params.success.call(params.context, data);
                    params.success.call(params.context, {

                        topics : _topics
                    });
                },

                error : function() {

                    params.error.call(params.context);
                }
            });
        },

        _extractTopics : function() {


        },

        getParentTopics : function(params){

            return this.makeRequest({

                method : 'GET',
                type : 'json',
                url : this.getProperty('baseUrl') + '/ss/topic/parents/' + params.topicId || this.get('id'),
                success : function(data) {

                    params.success.call(params.context, data.topic);
                },

                error : function() {

                    params.error.call(params.context);
                }
            });
        },
        getChildTopics2 : function(params){

            var _this = this;

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') +  '/ss/topic/' + (this.get('id') || params.topicId),
                data : {$level:1},
                type : 'json',
                async : false,
                success : function(data) {

                    params.success.call(params.context, {

                        topics : data
                    });
                },
                error : function() {

                    params.error.call(params.context);
                }
            });
        },

        getChildTopics : function(params){

            var _this = this;

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') +  '/ss/topic/' + (this.get('id') || params.topicId),
                data : {$level:1},
                type : 'json',
                success : function(data) {

                    var _topics = [];

                    //The first topic tree is the parent topic tree;
                    //pass that context to buildTopicTree funciton
                    //so we only get the children topics.
                    if(data.topicTree && data.topicTree[0]) {
                        //Pass the _topics JS object and the xml object.
                        _this._buildTopicTreeFromJson(_topics,
                                                      data.topicTree[0]);
                    }

                    params.success.call(params.context, {

                        topics : _topics
                    });
                },
                error : function() {

                    params.error.call(params.context);
                }
            });
        },

        getTopic : function(params){

            var _this = this;

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') +  '/ss/topic/' + (this.get('id') || params.topicId),
                data : {$level:0},
                type : 'json',
                success : function(data) {

                    params.success.call(params.context, data.topicTree[0].topic);
                },
                error : function() {

                    params.error.call(params.context);
                }
            });
        },
        getSubtree : function(){


            if(!this.get('id'))
                throw new Error('Topic Id must be defined in order to '+
                                'retrieve child topics');

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/topic/' + (this.get('id') || params.topicId),
                data : {$level:-1}
            });
        },

        getTopicById : function(params) {

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/topic/' + params.topicId,
                type : 'json',
                success : function(data) {

                    params.success.call(params.context, data.topicTree[0].topic);
                },
                error : function() {

                    params.error.call(params.context);
                },
                context : this
            });
        }
    });

    return Topic;
});
