define(['components/image/logo/image-logo'], function(C2CLogoComponent){

    return function ImageLogoTestSuite(){

        describe('Image Logo Component', function(){


            beforeEach(function(){

                this.component = new C2CLogoComponent();
                this.component.load();
            });

            it('should have one image element', function(){

                expect($(this.component.el)).toContain('img');
            });

        });
    }
});
