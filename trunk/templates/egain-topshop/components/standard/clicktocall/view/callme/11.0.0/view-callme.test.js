 define(['components/view/callme/view-callme'], function(ViewCallmeComponent){

    return function ViewCallmeTestSuite() {
        
        beforeEach(function(){

            this.component = new ViewCallmeComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    