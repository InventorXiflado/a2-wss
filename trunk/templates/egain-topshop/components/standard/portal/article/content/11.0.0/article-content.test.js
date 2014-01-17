define(['components/content/article/content-article'], function(ContentArticleComponent){
    
    //Article Content Component Test Suite
    //----------------------------
    return function(){
        
        describe('Article Content Component', function(){
            
            beforeEach(function(){

                this.component = new ContentArticleComponent();
                this.component.load();
            });

            it('should have a heading (h1) element', function(){

                expect($(this.component.el)).toContain('h1');
            });

            it('should have a small (<small>) element', function(){

                expect($(this.component.el)).toContain('small');
            });

            it('should have a main paragraph (<p>) element', function(){

                expect($(this.component.el)).toContain('p');
            });
        });
    };
});
