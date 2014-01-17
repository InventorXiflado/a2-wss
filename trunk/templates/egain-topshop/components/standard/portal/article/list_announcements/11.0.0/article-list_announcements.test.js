 define(['components/article/list_announcements/article-list_announcements'], function(ArticleList_announcementsComponent){

    return function ArticleList_announcementsTestSuite() {
        
        beforeEach(function(){

            this.component = new ArticleList_announcementsComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    