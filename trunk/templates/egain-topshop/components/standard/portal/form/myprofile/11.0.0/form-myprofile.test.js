 define(['components/form/login/form-login'], function(FormLoginComponent){

    return function FormLoginTestSuite() {
        
        beforeEach(function(){

            this.component = new FormLoginComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    