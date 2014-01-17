 define(['components/casebase/content/casebase-content'], function(CasebaseContentComponent){

    return function CasebaseContentTestSuite() {
        
        beforeEach(function(){

            this.component = new CasebaseContentComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    