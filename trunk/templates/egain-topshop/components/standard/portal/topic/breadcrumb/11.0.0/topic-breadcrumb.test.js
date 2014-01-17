 define(['components/topic/menu_flyout/topic-menu_flyout'], function(TopicMenu_flyoutComponent){

    return function TopicMenu_flyoutTestSuite() {
        
        beforeEach(function(){

            this.component = new TopicMenu_flyoutComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    