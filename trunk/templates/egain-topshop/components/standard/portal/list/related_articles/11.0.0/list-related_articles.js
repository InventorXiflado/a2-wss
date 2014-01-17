define(['underscore', 'core/component'], function(_, CoreComponent) {

    var ListRelatedArticlesComponent = CoreComponent.extend({

        name : 'list-related_articles',

        prepare : function() {

            var id = this.getProperty('article_id');
    
            this.articleModel = this.getModel('article'); //new Article({id:id});

            this.articleModel.getRelatedArticles({
                
                articleId : id,
                success: this._onRelatedArticlesSuccess,
                context : this
            });
        },

        _onRelatedArticlesSuccess : function(articles) {
        
            //Get only first 5 related articles.
            this.render({articles:_.first(articles, 5)});
        },

        buildUrl : function(article) {
        
            return this.app.getPageUrl('article', article.id, this.slugify(article.name));
        }
    });

    return ListRelatedArticlesComponent; 
});
