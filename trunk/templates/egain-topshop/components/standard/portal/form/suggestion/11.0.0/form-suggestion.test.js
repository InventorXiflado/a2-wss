 define(['components/form/suggestion/form-suggestion'], function(FormSuggestionComponent){

    return function FormSuggestionTestSuite() {
        
        beforeEach(function(){

            this.component = new FormSuggestionComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    