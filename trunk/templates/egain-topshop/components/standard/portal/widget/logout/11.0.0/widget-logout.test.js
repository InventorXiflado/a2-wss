 define(['components/widget/logout/widget-logout'], function(WidgetLogoutComponent){

    return function WidgetLogoutTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetLogoutComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    