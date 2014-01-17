 define(['components/search/topic_filter/search-topic_filter'], function(SearchTopic_filterComponent){

    return function SearchTopic_filterTestSuite() {
        
        beforeEach(function(){

            this.component = new SearchTopic_filterComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    