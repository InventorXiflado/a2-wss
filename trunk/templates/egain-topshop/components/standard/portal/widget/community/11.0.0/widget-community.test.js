 define(['components/widget/community/widget-community'], function(WidgetCommunityComponent){

    return function WidgetCommunityTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetCommunityComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    