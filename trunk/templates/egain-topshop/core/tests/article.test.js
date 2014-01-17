define(['core/models/article', 'text!tests/fixtures/models/article/retrieve_success_xml.xml'], function(Article, retrieve_success_xml_fixture){
    return function(){

        describe('Article', function(){

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
                this.article = new Article({id:123});
            });

            afterEach(function(){

                this.server.restore();
            });

            describe('after instantiation', function(){
                
                it('should have the correct id', function(){

                    expect(this.article.get('id')).toBe(123);
                });

                it('should have a valid url', function(){

                    expect(this.article.url()).toBe('/system/ws/v1/ss/article/123');
                });

            });

            describe('after load', function(){
                
                beforeEach(function(){

                    this.article.load();
                });

                it('should make one request', function(){
                
                    expect(this.server.requests.length).toEqual(1);
                });

                it('should make a GET request', function(){

                    expect(this.server.requests[0].method).toBe("GET");
                });

                it('should make a request to the correct URL', function(){

                    expect(this.server.requests[0].url).toBe('/system/ws/v1/ss/article/123?portalId=1001');
                });

                it('should send xml accepts header', function(){
                    
                    expect(this.server.requests[0].requestHeaders['Accept']).toBe('application/xml');
                });
            });

            describe('on parse', function(){

                it('should have the correct attributes', function(){

                    this.article.fetch();
                    this.server.respond();

                    expect(this.article.get('title')).toBe('Awesome Article Right Here');
                });
            });

            describe('on first request', function(){

                it('should not sent the x-egain-session-id header', function(){


                });
            });

            describe('upon first request', function(){

                it('should retain the x-egain-session-id header', function(){


                });
            });

            describe('on get related articles', function(){
                
                beforeEach(function(){

                    this.article.getRelatedArticles();  
                });

                it('should make a GET request', function(){

                    expect(this.server.requests[0].method).toBe('GET');
                });

                it('should make a request to the correct URL', function(){

                    expect(this.server.requests[0].url).toBe('/system/ws/v1/ss/article/related/123?portalId=1001');
                });

                describe('with successful responses', function(){
                    
                    beforeEach(function(){

                         
                    });
                });
            });

            describe('on assign rating', function(){
            
                beforeEach(function(){

                    this.article.assignRating(5);
                });
            
                it('should make a PUT request', function(){

                    expect(this.server.requests[0].method).toBe('PUT');
                });

                it('should make a request to the correct URL', function(){

                    expect(this.server.requests[0].url)
                    .toBe('/system/ws/v1/ss/article/rating/123?portalId=1001&score=5');
                });
            
                it('should run success callback on 201 response', function(){


                });
            });

            describe('on get ratings', function(){
            
                
                beforeEach(function(){

                    this.article.getRatings();
                });

                it('should make a GET request', function(){
                    
                    expect(this.server.requests[0].method).toBe('GET');
                });
            });
            
            describe('on retrieve with xml-based response', function(){
                
                beforeEach(function(){
                    
                    this.article = new Article({id:2040});
                });

                afterEach(function(){

                    this.server.restore();
                });

                describe('with 200 responses', function(){
                
                    beforeEach(function(){
                        
                        this.server.respondWith(

                            "GET", 
                            "/system/ws/v1/ss/article/2040?portalId=1001",[
                            200,
                            {'content-type':'application/xml','x-egain-session':'c58780e3-41df-45f1-88d9-1ea5005ad1b7'},
                            retrieve_success_xml_fixture
                        ]);
                    });

                    it('should run success callback', function(){
                        
                        var spy = sinon.spy();

                        runs(function(){
                            
                            this.article.retrieve({success:spy}, this);
                            this.server.respond();

                            expect(spy.called).toBeTruthy();
                        });
                    });

                    it('should return a defined article object', function(){

                        var spy = sinon.spy(); 

                        runs(function(){

                            this.article.retrieve({
                                
                                success: function(article){
                                    
                                    expect(article).toBeDefined();
                                }

                            }, this);

                            this.server.respond();
                        });
                    });

                    it('should return the correct article name', function(){
                        
                        var spy = sinon.spy(); 

                        runs(function(){

                            this.article.retrieve({
                                
                                success: function(article){
                                    
                                    expect(article.name).toBe("Uranus");
                                }

                            }, this);

                            this.server.respond();
                        });
                    });

                    it('should have no article attachment', function(){

                        var spy = sinon.spy(); 

                        runs(function(){

                            this.article.retrieve({

                                success : function(article){

                                    expect(article.hasattachments).toBe(false);
                                }

                            }, this);

                            this.server.respond();
                        });
                    });
                });

                describe('on 404 responses', function(){
                    
                    beforeEach(function(){

                        this.server.respondWith(
                        
                            "GET",
                            "/system/ws/v1/ss/article/2040?portalId=1001",
                            [404,
                            {'content-type':'application/xml','x-egain-session':'c58780e3-41df-45f1-88d9-1ea5005ad1b7'},
                             retrieve_success_xml_fixture
                            ]
                        );

                    });

                    it('should run the error callback', function(){
                    
                        var spy = sinon.spy();

                        runs(function(){
                            
                            this.article.retrieve({

                                error: spy
                            });

                            this.server.respond();

                            expect(spy.called).toBeTruthy();
                        });
                    });
                });
            });

            describe('on get attachment', function(){

                beforeEach(function(){
                    
                    this.article.set({'attachment_id':35});
                    this.article.getAttachment();
                });

                it('should make a GET request', function(){

                    expect(this.server.requests[0].method).toBe('GET');
                });

                it('should make a request to the correct URL', function(){

                    expect(this.server.requests[0].url)
                    .toBe('/system/ws/v1/ss/article/attachment/35?portalId=1001');
                });

                it('should run the success callback on 200 response', function(){
                    
                    var spy = sinon.spy();

                    this.article.getAttachment({
                        
                        error: spy
                    });
                    this.server.respond();

                    //expect(spy.called).toBeTruthy();
                });
            });
        });
    }
});
