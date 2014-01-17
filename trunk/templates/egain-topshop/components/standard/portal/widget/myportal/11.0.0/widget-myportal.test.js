 define(['components/widget/myportal/widget-myportal'], function(WidgetMyportalComponent){

    return function WidgetMyportalTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetMyportalComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    