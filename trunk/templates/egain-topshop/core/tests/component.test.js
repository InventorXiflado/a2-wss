define(function(){
    
    //Search Basic Component Test Suite
    //---------------------------------
    return function coreComponentTest(componentClass){

        describe("Core Component", function(){

            beforeEach(function(){
                
                //Initialize component.
                this.component = new componentClass();
            });

            afterEach(function(){

                //Remove component.
                this.component.remove();
            });
            
            describe('after instantiation', function(){

                it('should have the a defined name', function(){

                    expect(this.component.name).toBeDefined();
                });

                it('should have an actual DOM element', function(){

                    expect($(this.component.el)).toExist();
                });

                it('should have a DIV as a top-level element', function(){

                    expect(this.component.el.nodeName).toBe('DIV');
                });

                it('should have a class name called "component"', function(){

                    expect($(this.component.el)).toHaveClass('component');  
                });

                it('should have a class with the same name as its name', function(){
                    
                    expect($(this.component.el)).toHaveClass(this.component.name);
                });

                it('should have a component-name attribute with the value of its name', function(){

                    expect($(this.component.el).attr('component-name')).toBe(this.component.name);
                });

                it('should trigger bound functions', function(){

                    var spy = sinon.spy();

                    this.component.bind('arbitrary-event', spy);
                    this.component.trigger('arbitrary-event');
                    
                    expect(spy.called).toBeTruthy();
                });
            });

            describe('before load', function(){

                it('should not trigger prepare event yet', function(){

                    var spy = sinon.spy();
                    this.component.bind('prepare', spy); 
                    
                    expect(spy.called).toBeFalsy();
                });

                it('should not trigger ready event yet', function(){

                    var spy = sinon.spy();
                    this.component.bind('ready', spy);

                    expect(spy.called).toBeFalsy();
                });

            });
            
            describe('501-compliance', function() {

                 it('should have alt tags in all the image tags', function() {

                    expect($(this.component.el).find('img').attr('alt')).toBeTruthy();
                 });
            });

            describe('XSS', function() {
                
                it('should not have a script tag inside the element', function() {

                    expect($(this.component.el).find('script')).toBeFalsy();
                });

                it('should not have javascript-enabled "dynsrc" attribute in image elements', function() {

                    expect($(this.component.el)
                                .find('img')
                                .attr('dynsrc')
                                .indexOf('javascript:') == 0).toBeFalsy();

                });

                it('should not have lowsrc', function() {

                });

                it('should not have', function() {


                });
            });

            describe('after load', function(){

                it('should trigger prepare event once', function(){

                    var spy = sinon.spy();
                    this.component.bind('prepare', spy); 
                    this.component.load();
                    
                    expect(spy.called).toBeTruthy();
                });

                it('should trigger a ready event once', function(){
                    
                    var spy = sinon.spy();
                    this.component.bind('ready', spy); 
                    this.component.load();
                    
                    expect(spy.called).toBeTruthy();
                });
            });
        });
    };
});
