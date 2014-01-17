 define(['components/form/email_friend/form-email_friend'], function(FormEmail_friendComponent){

    return function FormEmail_friendTestSuite() {
        
        beforeEach(function(){

            this.component = new FormEmail_friendComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    
