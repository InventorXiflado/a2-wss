 define(['components/list/article/list-article'], function(ListArticleComponent){

    return function ListArticleTestSuite() {
        
        beforeEach(function(){

            this.component = new ListArticleComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    