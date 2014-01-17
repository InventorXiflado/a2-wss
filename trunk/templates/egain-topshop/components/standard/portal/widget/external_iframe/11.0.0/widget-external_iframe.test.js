 define(['components/widget/external_iframe/widget-external_iframe'], function(WidgetExternal_iframeComponent){

    return function WidgetExternal_iframeTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetExternal_iframeComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    