define(['core/model'], function(Model){

    var Customer = Model.extend({

        forgotPassword : function(params) {

            this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/ss/customer/'+params.loginId+'/password',
                type : 'json',

                data : {

                    loginId : params.loginId
                },

                success : function(data) {

                    params.success.call(params.context, data);
                },

                error : function(jqXHR) {

                    params.error.call(params.context, jqXHR);
                }
            });
        },

        register : function(params) {

            var customerData = {

                loginId : params.loginId,
                firstName : params.firstName,
                lastName : params.lastName,
                emailAddress : params.emailAddress
            };

            this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/ss/customer',
                type : 'json',

                data : {

                    data : JSON.stringify(customerData)
                },

                success : function(data) {

                    params.success.call(params.context, data);
                },

                error : function(jqXHR) {

                    params.error.call(params.context, jqXHR);
                }
            });
        }
    });

    return Customer;
});
