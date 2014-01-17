 define(['components/widget/link_bar/widget-link_bar'], function(WidgetLink_barComponent){

    return function WidgetLink_barTestSuite() {
        
        beforeEach(function(){

            this.component = new WidgetLink_barComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    