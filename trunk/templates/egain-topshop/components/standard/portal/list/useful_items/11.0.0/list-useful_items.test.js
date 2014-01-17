 define(['components/list/popular_articles/list-popular_articles'], function(ListPopular_articlesComponent){

    return function ListPopular_articlesTestSuite() {
        
        beforeEach(function(){

            this.component = new ListPopular_articlesComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    