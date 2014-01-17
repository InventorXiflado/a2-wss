 define(['components/list/casebases/list-casebases'], function(ListCasebasesComponent){

    return function ListCasebasesTestSuite() {
        
        beforeEach(function(){

            this.component = new ListCasebasesComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    