 define(['components/list/mysuggestions/list-mysuggestions'], function(ListMySuggestionsComponent){

    return function ListMySuggestionsTestSuite() {
        
        beforeEach(function(){

            this.component = new ListMySuggestionsComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    