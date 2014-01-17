 define(['components/widget/copyright/widget-copyright'], function(WidgetCopyrightComponent){

    return function WidgetCopyrightTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetCopyrightComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    