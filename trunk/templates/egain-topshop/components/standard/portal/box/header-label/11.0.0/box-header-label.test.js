define(['components/image/logo/image-logo'], function(ImageLogoComponent){

    return function ImageLogoTestSuite(){

        describe('Image Logo Component', function(){


            beforeEach(function(){

                this.component = new ImageLogoComponent();
                this.component.load();
            });

            it('should have one image element', function(){

                expect($(this.component.el)).toContain('img');
            });

        });
    }
});
