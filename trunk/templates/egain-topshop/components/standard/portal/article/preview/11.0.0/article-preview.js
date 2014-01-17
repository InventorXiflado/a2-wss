define(['underscore',
        'core/component',
        'core/helpers'],

function(_,
         CoreComponent,
         helpers) {

    var ArticlePreviewComponent = CoreComponent.extend({

        name : 'article-preview',

        events : {
    		"click .js-article-view-click" : "onArticleViewClick"
        },

        prepare : function() {

            this.articleModel = this.getModel('article');
            this.topicId = this._getTopicId();

            // get saved "context" of the articlesByTopic - where it's being accessed from,
            // e.g. from GH, search results, popular articles etc.
            this.viewContext = this.getState('topicViewContext', '', true);

            this.articleModel.getTopicArticles({

                topicId : this.topicId,
                success : this._onTopArticlesRetrieveSuccess,
                limit : this.getProperty('shown_article_count', 2),
                skip : 0,
                context : this,
                attributes : ['all'],
                viewContext : this.viewContext
            });

            // clear the view context
            if (this.viewContext) {
                this.saveState('topicViewContext', '', true);
                this.viewContext = null;
            }

        },

        _onTopArticlesRetrieveSuccess : function(data) {

            //TODO : if preview article is missing an image URL, add a stock image instead (Arvind to provide the image)
            /*
            var imageUrls = [

                'http://sphotos.xx.fbcdn.net/hphotos-ash3/p480x480/546338_284365148310062_259077534172157_658549_46589416_n.jpg',
                'http://media.themakingspot.com/sites/default/files/imagecache/article-project-current-main-460-460/CrossStitch/CrossStitcher/196/XST196.gift1/XST196.gift1._fc21505.jpg'
            ];
            */

            //Strip out the html tags in the content of the article.
            var articles = _.map(data.articles, function(article, index) {

                if(article['content'])  {

                    article['content'] = helpers.stripHtmlTags(article['content']).substring(0, 400) + '...';
                }
                //article['imageUrl'] = imageUrls[index];

                return article;
            });

            this.render({

                articles : articles
            });
        },

		_getTopicId : function() {

            var id = this.getProperty('topic_id');//|| window.location.hash.split('/')[1];

            return id;
        },

		/** Save this article view content (browsing topic) in the browser */
        onArticleViewClick : function(e) {
            this.saveState('articleViewContext', 'article_view_browse_tree', true);
        },

        buildUrl : function(article) {

            return this.app.getPageUrl('article', article.id, this.slugify(article.name));
        }
    });

    return ArticlePreviewComponent;
});
