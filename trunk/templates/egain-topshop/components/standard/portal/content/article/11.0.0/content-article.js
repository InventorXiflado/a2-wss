define(['core/component'], function(BaseComponent) {

    var ContentArticleComponent = BaseComponent.extend({
        
        name : "content-article",

        events : {

            "click .email" : "emailFriend",
            "click .attachment" : "getAttachment",
            "click .favorites" : "addAsFavorite",
            "click .print" : "onArticlePrintClick",
            "submit form.feedback-form" : "onFeedbackSubmit",
            "keyup textarea" : "onFeedbackTyping"
        },

        prepare : function(){
        
            this.articleModel = this.getModel('article');
            this.favorite = this.getModel('favorite');

            var id = this.getProperty('article_id');

            this.articleId = id;

            //Creates the article model, with the argument of the article_id.
            //this.articleModel = new Article({id:id});

            
            //Retrieve the article.
            this.articleModel.retrieve({
                
                articleId : id,

                //If successful, then run the articleRetrieved function.
                success : this._onArticleRetrieveSuccess,

                //If error happened, then run the generic declareError function.
                error : this.declareError, //_articleRetrieveError,

                //context
                context : this

            }, this);
        },
        
        _onArticleRetrieveSuccess : function(article) {
            
            console.log("ON ARTICLE RETIEVE", article);
            
            //Save the reference.
            this.article = article;

            this.render({
                
                article : article,
                favorited : this.favorite.isFavorite(article.id)
            });
        
            /*
            this.article.getRatings({

                success : this._articleRatingRetrieved,
                error : this._articleError,
                context : this
            });
            */
        },

        _articleRetrieveError : function(){
            
            //Run the error.
            $(this.el).html('Something went wrong.');
        },

        _articleRatingRetrieved : function() {

            //Render the element with the article data.
            //this.render(article);
        },

        emailFriend : function(e) {
            
            e.preventDefault();
            
            /*
            this.articleModel.assignRating({
                
                articleId : this.article.id,
                score : 10,
                success : this._onRatingSuccess,
                error : this._onRatingError,
                context : this
            });
            */

            var _this = this;

            var component = this.app.page.createComponent({
            
                name : 'standard.portal.form.email_friend'

            }, function(component) {
                
                //Tell the current page to show modal containing the email friend component that we just downloaded.
                _this.app.page.showModal({
                    
                    component : component
                });
            });
        },

        _onRatingSuccess : function() {

            console.log('rating success');
        },

        _onRatingError : function() {

            console.log('rating error');
        },

        getAttachment : function() {

            this.articleModel.getAttachment({
            
                success : this._onAttachmentRetrieve,
                context : this
            });
        },

        addAsFavorite : function(e) {
    
            e.preventDefault();

            this.favorite.addFavorite(this.article);

            this.app.navigateToPage('favorites');
        },

        _onAttachmentRetrieve : function() {
            
            console.log('retrieve');
        },

        onArticlePrintClick : function(e) {
            
            e.preventDefault();

            //Hide the global wrap.
            $('#global-wrap').hide();
            
            //Create the print wrap for the print version.
            var $printWrap = $(this.compileTemplate('print', {
                
                name : this.article.name,
                content : this.article.content,
                id : this.article.id,
                page_url : window.location.href
            }));

            console.log("print wrap", $printWrap);

            $("body").append($printWrap);

            window.print();
             
            //Show the actual page again.
            $printWrap.remove();

            $('#global-wrap').show();
        },

        onFeedbackSubmit : function(e) {
            
            e.preventDefault();
            
            var feedbackString = $(e.target).find('textarea').val();
            
            this.articleModel.sendFeedback({
                
                articleId : this.articleId,
                feedback : feedbackString,
                success : this._onFeedbackReceivedSuccess,
                error : this._onFeedbackReceivedError
            });
        },

        _onFeedbackReceivedSuccess : function() {
            
            this.$('form.article-feedback').val('');
        },

        _onFeedbackErrorSuccess : function() {

            this.$('form.article-feedback').val('');
        },

        onFeedbackTyping : function(e) {
            
            console.log('scroll!');

            var max = 100; 
            var textareaEl = e.target;


            if(textareaEl.scrollHeight > max) {

                console.log('scroll height is more than max');

                if(textareaEl.style.overflowY != 'scroll') {
                    
                    textareaEl.style.overflowY = 'scroll';
                }

                return;
            }

            /* Make sure element does not have scroll bar to prevent jumpy-ness */
            if (textareaEl.style.overflowY != 'hidden') { textareaEl.style.overflowY = 'hidden' }

            /* Now adjust the height */
            var scrollH = textareaEl.scrollHeight - 5;
            var actualHeight = parseInt(textareaEl.style.height.replace(/[^0-9]/g,''));

            console.log('scroll height', textareaEl.scrollHeight, actualHeight);

            if(scrollH > actualHeight) {

                console.log('scrollHeight is more');
                textareaEl.style.height = scrollH+'px';
            } 

        }
    });

    return ContentArticleComponent;
});
