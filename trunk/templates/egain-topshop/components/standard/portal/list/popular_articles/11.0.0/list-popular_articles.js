 define(['core/component'], function(CoreComponent) {

    var ListPopularArticlesComponent = CoreComponent.extend({

        name : 'list-popular_articles',

        events : {
            
            'click .js-load-more' : 'onLoadMoreClick',
            'click .js-article-view-click' : 'onArticleViewClick'
        },

        prepare : function() {

            this.dfaq = this.getModel('dfaq');

            this.limit = this.getProperty('limit', 5);
            this.skip = this.getProperty('skip', 0);

            this.dfaq.retrieve({

                success : this._onDfaqRetrieveSuccess,
                error : this.declareError, //_dfaqRetrieveError,
                limit : this.limit,
                skip : this.skip,
                context : this
            });
        },

        _onDfaqRetrieveSuccess : function(data) {
            
            var showLoadMore = this._shouldShowLoadMore(data.article_actual_count);

            console.log('SHOULD SHOW', showLoadMore, data);

            this.render({

                articles : data.articles,
                show_load_more : showLoadMore
            });
        },

        _dfaqRetrieveError : function() {

			//Should do something on error
        },

        onLoadMoreClick : function() {
            
            //Increase the skip by the maximum limit.
            this.skip += this.limit;

            this.dfaq.retrieve({
                
                success : this._onDfaqRetrieveMoreSuccess,
                error : this._dfaqRetrieveError,
                limit : this.limit,
                skip : this.skip,
                context : this
            });
        },

        _onDfaqRetrieveMoreSuccess : function(data) {
            
            //Hide the load more if appropriate.
            if(!this._shouldShowLoadMore(data.article_actual_count)) {

                this.$('.egce-load-more').hide(); 
            }
            
            var dividerHtml = this.compileTemplate('divider', 
            									{'top_entry_count':this.skip - this.getProperty('skip', 0)});

            this.$('ul').append(dividerHtml);

            _.each(data.articles, function(article) {
                
                var rowHtml = this.compileTemplate('row', article); 

                this.$('ul').append(rowHtml);

            }, this);
        },

        _shouldShowLoadMore : function(total_count) {


            console.log("SHOULD SHOW 2", total_count, (this.limit+this.skip), total_count > (this.limit + this.skip));

            return total_count > (this.limit + this.skip);
        },
        
		/** Save this article view content (dfaq = popular articles) in the browser */
        onArticleViewClick : function(e) {
            this.saveState('articleViewContext', 'article_view_dfaq', true);
        },

        buildUrl : function(article) {

			return this.app.getPageUrl(this.getProperty("article_page") || "article", article.id,
                                        this.slugify(article.name));
        }
    });

    return ListPopularArticlesComponent; 
});
