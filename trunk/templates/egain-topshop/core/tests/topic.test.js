define(['core/models/topic'], function(Topic){
    
    return function(){

        describe('Topic', function(){

            beforeEach(function(){
                
                this.server = sinon.fakeServer.create();
                this.server.respondWith(
                    
                    "GET",
                    "/system/ws/v1/ss/article/123",
                    [
                        200,
                        {"Content-Type":"application/json"},
                        '{"id":123, "title":"Awesome Article Right Here"}'
                    ]
                );
                this.topic = new Topic({id:123});
            });

            afterEach(function(){

                this.server.restore();
            });

            describe('on get root topics', function(){
                
                beforeEach(function(){

                    this.topic.getRootTopics();
                });

                it('should make a GET request', function(){
                    
                    expect(this.server.requests[0].method).toBe('GET'); 
                });

                it('should make a request to the correct URL', function(){
                
                    //%24 is uri-encoded '$' dollar-sign.
                    expect(this.server.requests[0].url)
                    .toBe('/system/ws/v1/ss/topic?portalId=1&%24level=0');
                });
            });

            describe('on get parent topics', function(){
                
                beforeEach(function(){

                    this.topic.getParentTopics();
                });

                it('should make a GET request', function(){
                    
                    expect(this.server.requests[0].method).toBe('GET'); 
                });

                it('should make a request to the correct URL', function(){
                
                    //%24 is uri-encoded '$' dollar-sign.
                    expect(this.server.requests[0].url)
                    .toBe('/system/ws/v1/ss/topic/parents/123?portalId=1');
                });
            });


            describe('on get child topics', function(){
                
                beforeEach(function(){

                    this.topic.getChildTopics();
                });

                it('should make a GET request', function(){
                    
                    expect(this.server.requests[0].method).toBe('GET'); 
                });

                it('should make a request to the correct URL', function(){
                
                    //%24 is uri-encoded '$' dollar-sign.
                    expect(this.server.requests[0].url)
                    .toBe('/system/ws/v1/ss/topic/123?portalId=1&%24level=1');
                });
            });

            describe('on get subtree of topics', function(){
                
                beforeEach(function(){

                    this.topic.getSubtree();
                });

                it('should make a GET request', function(){
                    
                    expect(this.server.requests[0].method).toBe('GET'); 
                });

                it('should make a request to the correct URL', function(){
                
                    //%24 is uri-encoded '$' dollar-sign.
                    expect(this.server.requests[0].url)
                    .toBe('/system/ws/v1/ss/topic/123?portalId=1&%24level=-1');
                });
            });
        });
    }
});
