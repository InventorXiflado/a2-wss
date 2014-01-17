define(['underscore',
        'core/component', 
        'core/helpers'], 

function(_,
         CoreComponent,
         helpers) {

    var ArticleRateComponent = CoreComponent.extend({

        name : 'article-rate',

        events : {

            'click button.js-rate-up' : 'onRateUp',
            'click button.js-rate-down' : 'onRateDown'
        },

        prepare : function() {

            this.articleId = this.getProperty('article_id');
            this.articleModel = this.getModel('article');

            console.log("article model", this.articleModel);

            this.render();
        },

        onRateUp : function() {

            this.articleModel.assignRating({

                articleId : this.articleId,
                score : this.articleModel.getProperty('rateUpScore'),
                success : this._onRateUpSuccess,
                error : this.declareError
            });
        },

        onRateDown : function() {

            this.articleModel.assignRating({

                articleId : this.articleId,
                score : this.articleModel.getProperty('rateDownScore'),
                success : this._onRateDownSuccess,
                error : this.declareError
            });
        },

        _onRateUpSuccess : function() {


        },

        _onRateDownSuccess : function() {


        }
    });

    return ArticleRateComponent; 
});
