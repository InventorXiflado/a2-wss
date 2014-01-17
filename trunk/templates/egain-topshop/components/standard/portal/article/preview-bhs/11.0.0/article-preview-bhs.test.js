 define(['components/article/preview/article-preview'], function(ArticlePreviewComponent){

    return function ArticlePreviewTestSuite() {
        
        beforeEach(function(){

            this.component = new ArticlePreviewComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    