define(['core/model'], function(Model) {

    var Email = Model.extend({

        send : function(params) {
            
            if(!params.articleId)
                throw new Error("articleId is needed to send email through the Email model");
            this.makeRequest({
                
                url : this.getProperty('baseUrl') + '/ss/email',

                data : {
                
                    data : JSON.stringify({

                        fromEmail : params.fromEmail,
                        fromName : params.fromName.replace(' ', '+'),
                        toEmail : params.toEmail,
                        toName : params.toName.replace(' ', '+'),
                        message : params.message,
                        articleId : params.articleId
                    })
                },

            success_codes : [201],

                method : 'POST',
                type : 'json',

                success : function() {

                    //Call callback, for now.
                    params.success.call(params.context);
                }

            });
        }
    });

    return Email;
});
