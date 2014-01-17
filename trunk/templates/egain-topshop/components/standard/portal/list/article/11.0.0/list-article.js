 define(['core/component', 'core/helpers'] , function(CoreComponent, helpers) {

    var ListArticleComponent = CoreComponent.extend({

        name : 'list-article',

        events : {

            'click .js-load-more' : 'onLoadMoreClick',
            'click .js-article-view-click' : 'onArticleViewClick'
        },

        prepare : function() {

            this.article = this.getModel('article'); //new Article();
            this.topic = this.getModel('topic'); //new Topic();

            this.topicId = this._getTopicId();

            this.limit = this.getProperty('limit', 5);
            this.skip = this.getProperty('skipped_article_count', 0);

            //We need 2 ajax requests before rendering
            this._successful_ajax_request = 0;
            // Need to hide this component if there are no articles to show
            this.isHide = false;
            // get saved "context" of the articlesByTopic - where it's being accessed from,
            // e.g. from GH, search results, popular articles etc.
            this.viewContext = this.getState('topicViewContext', '', true);

            //Request the topic articles.
            this.article.getTopicArticles({

                success : this._onArticlesRetrieveSuccess,
                error : this._onArticlesRetrieveError,
                topicId : this.topicId,
                skip : this.skip,
                limit : this.limit,
                context : this,
                viewContext : this.viewContext
            });

            // clear the view context
            if (this.viewContext) {
                this.saveState('topicViewContext', '', true);
                this.viewContext = null;
            }

            //Request the topic info.
            this.topic.getTopicById({

                success : this._onTopicRetrieveSuccess,
                topicId : this.topicId,
                context : this
            });
        },

        _getTopicId : function() {

            var id = this.getProperty('topic_id');//|| window.location.hash.split('/')[1];

            return id;
        },

        _onArticlesRetrieveSuccess : function(data) {

            console.log('list article component!', data);

            if (data.articles.length > 0) {
            	this._successful_ajax_request++;
	            this._articles = data.articles;
	            this.article_actual_count = data.article_actual_count;

	            if(this._successful_ajax_request == 2)
	                this._render();
            }
            else {
            	this.isHide = true;
            	this.hide();
            }
        },

        _shouldShowLoadMore : function(max_count) {

            return this.limit + this.skip < max_count;
        },

        _onArticlesRetrieveError : function() {


        },

        _onTopicRetrieveSuccess : function(topic) {

        	//document.title = topic.name;

        	// update this page's meta description
        	helpers.createOrUpdateMetaTag('description', topic.description);

        	if (!this.isHide) {
        		this._successful_ajax_request++;
	            this._topic = topic;

	            //Wait until both topic and article ajax requests succeeds.
	            if(this._successful_ajax_request == 2)
	                this._render();
        	}
        	else {
        		this.hide();
        	}
        },

        _render : function() {

            this.render({

                articles:this._articles,
                topic:this._topic,
                show_load_more : this._shouldShowLoadMore(
                                        this.article_actual_count),
                article_actual_count : this.article_actual_count
            });
        },

        onLoadMoreClick : function() {

            //Update the skip variable.
            this.skip += this.limit;

            this.article.getTopicArticles({

                success : this._onMoreArticlesRetrieveSuccess,
                topicId : this.topicId,
                skip : this.skip,
                limit : this.limit,
                context : this
            });
        },

        _onMoreArticlesRetrieveSuccess : function(data) {

            if(!this._shouldShowLoadMore(data.article_actual_count)) {

                this.$('.js-load-more').hide();
            }

            //Create the divider
            this.$('ul').append(this.compileTemplate('divider', {

                'top_entry_count' : this.skip
                                    - this.getProperty('skipped_article_count')
            }));

            _.each(data.articles, function(article) {

                this.$('ul').append(this.compileTemplate('row', article));

            }, this);
        },

		/** Save this article view content (browsing topic) in the browser */
        onArticleViewClick : function(e) {
            this.saveState('articleViewContext', 'article_view_browse_tree', true);
        },

        buildUrl : function(article) {

            return this.app.getPageUrl('article',
                                        article.id,
                                        this.slugify(article.name));
        }
    });

    return ListArticleComponent;
});
