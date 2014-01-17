define(['components/widget/quicklinks/widget-quicklinks'], function(WidgetQuicklinksComponent){

    return function(){

        describe('Quicklinks Widget Component', function(){

            beforeEach(function(){
                
                this.component = new WidgetQuicklinksComponent();
                this.component.load();
            });

            afterEach(function(){

                this.component.remove();
            });

            
            it('should contain a heading (h1) element', function(){
                
                expect($(this.component.el)).toContain('h1');
            });

            it('should containt a list element (ul) element', function(){

                expect($(this.component.el)).toContain('ul');
            });
        });

    }
});
