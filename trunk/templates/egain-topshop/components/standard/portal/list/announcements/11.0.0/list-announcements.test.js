 define(['components/list/announcements/list-announcements'], function(ListAnnouncementsComponent){

    return function ListAnnouncementsTestSuite() {
        
        beforeEach(function(){

            this.component = new ListAnnouncementsComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    