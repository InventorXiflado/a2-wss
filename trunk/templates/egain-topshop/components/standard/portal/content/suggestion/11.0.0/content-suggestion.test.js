define(['components/content/suggestion/content-suggestion'], function(ContentArticleComponent){
    
    //Suggestion Content Component Test Suite
    //----------------------------
    return function(){
        
        describe('suggestion Content Component', function(){
            
            beforeEach(function(){

                this.component = new ContentArticleComponent();
                this.component.load();
            });
        });
    };
});
