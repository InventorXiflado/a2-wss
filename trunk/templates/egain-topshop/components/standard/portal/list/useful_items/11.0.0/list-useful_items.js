 define(['core/component'], function(CoreComponent) {

    var ListUsefulItemsComponent = CoreComponent.extend({

        name : 'list-popular_articles',

        events : {
            
            'click .js-load-more' : 'onLoadMoreClick',
            'click .js-article-view-click' : 'onArticleViewClick'
        },

        prepare : function() {

            this.generalModel = this.getModel('general');

            this.limit = this.getProperty('limit', 5);
            this.skip = this.getProperty('skip', 0);
            this.listId = this.getProperty('listId');

            this.generalModel.getUsefulFolderItems({
                
                folderId : this.listId,
                success : this._onFolderItemsRetrieveSuccess,
                error : this.declareError, //_dfaqRetrieveError,
                limit : this.limit,
                skip : this.skip,
                context : this
            });
        },

        _onFolderItemsRetrieveSuccess : function(data) {
            
            //var show_load_more = this._shouldShowLoadMore(data.article_actual_count);

            var articles = data.article;
            for (var i in articles) {
	            if (articles[i].articleType == 1) {
	               	articles[i].articleIcon = "icon-map-marker";
	            }
	            else {
	            	articles[i].articleIcon = "icon-file";
	            }
            }
                        
            this.render({
                
                name : data.name,
                articles : articles
                //show_load_more : show_load_more
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

            return total_count > (this.limit + this.skip);
        },
        
		/** Save this article view content (useful items) in the browser */
        onArticleViewClick : function(e) {
            this.saveState('articleViewContext', 'article_view_useful_items', true);
        },

        buildUrl : function(article) {

            return this.app.getPageUrl("article",
                                        article.id,
                                        this.slugify(article.name));
        }
    });

    return ListUsefulItemsComponent; 
});
