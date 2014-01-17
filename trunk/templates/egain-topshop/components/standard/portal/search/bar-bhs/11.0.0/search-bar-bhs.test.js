 define(['components/search/bar/search-bar'], function(SearchBarComponent){

    return function SearchBarTestSuite() {
        
        beforeEach(function(){

            this.component = new SearchBarComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    