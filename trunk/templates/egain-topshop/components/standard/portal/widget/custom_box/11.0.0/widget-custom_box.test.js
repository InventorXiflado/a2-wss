 define(['components/widget/custom_box/widget-custom_box'], function(WidgetCustom_boxComponent){

    return function WidgetCustom_boxTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetCustom_boxComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    