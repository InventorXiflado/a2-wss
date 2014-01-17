 define(['components/list/related_articles/list-related_articles'], function(ListRelated_articlesComponent){

    return function ListRelated_articlesTestSuite() {
        
        beforeEach(function(){

            this.component = new ListRelated_articlesComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    