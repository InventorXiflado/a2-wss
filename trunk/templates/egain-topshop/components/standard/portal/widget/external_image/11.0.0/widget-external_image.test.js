 define(['components/widget/external_image/widget-external_image'], function(WidgetExternal_imageComponent){

    return function WidgetExternal_imageTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetExternal_imageComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    