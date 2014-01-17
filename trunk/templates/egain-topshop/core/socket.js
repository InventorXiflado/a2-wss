define(['backbone'], function(Backbone) {
    
    /**

    */
    var Socket = Backbone.Model.extend({
        
        initialize : function() {
            
            try { 

                //It uses easyXDM.
                this._socket = new easyXDM.Socket({

                    debug : false,
                    
                    onMessage : function() {
                        
                    }
                });

            } catch(e) {
                    
                console.log("EASYXDM not loading", e);
                try{
                    if(window.addEventListener)
                    {
                        window.addEventListener("message",
                            function(event) {
                                var params = event.data.split("||");
                                console.log("Received '" + event.data + "' from '" + event.origin + "'");
                        
                                this.app.navigateToPage('searchresults', event.data);
                                //app.send('egain11.product.search.refine', refinementData);
                            },
                            false);
                    }
                    else
                    {
                        window.attachEvent("onmessage",
                            function(event) {
                                var params = event.data.split("||");
                                console.log("Received '" + event.data + "' from '" + event.origin + "'");

                                this.app.navigateToPage('searchresults', event.data);
                                //app.send('egain11.product.search.refine', refinementData);
                });
                    }
                } catch(e) {
                    console.log("addEventListener failed", e);
                }
            }
        },

        navigateToPage : function(pageName) {

            var url = this.app.getPageUrl
                              .apply(this.app,
                              [pageName].concat(_.rest(arguments)));

            if(!url)
                return;

            console.log("navigate to page:", url);

            //navigate to the actual url
            this.navigate(url, {trigger:true});
        },

        sendMessage : function(message) {
            
            if(this._socket)
                this._socket.postMessage(message);
        },

        send : function(event, message) {
            
            var event = arguments[0];
            var args = [];

            for(var i = 1; i < arguments.length; i++) {

                args.push(arguments[i]); 
            }

            var data = {

                event : event,
                args : args
            };

            if(this._socket)
                this._socket.postMessage(JSON.stringify(data));

        }
    });

    return Socket;
});
