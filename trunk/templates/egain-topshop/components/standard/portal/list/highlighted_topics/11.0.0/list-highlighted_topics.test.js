 define(['components/list/highlighted_topics/list-highlighted_topics'], function(ListHighlighted_topicsComponent){

    return function ListHighlighted_topicsTestSuite() {
        
        beforeEach(function(){

            this.component = new ListHighlighted_topicsComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    