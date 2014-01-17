 define(['components/form/feedback/form-feedback'], function(FormFeedbackComponent){

    return function FormFeedbackTestSuite() {
        
        beforeEach(function(){

            this.component = new FormFeedbackComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    