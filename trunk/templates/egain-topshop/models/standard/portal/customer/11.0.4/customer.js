define(['core/model'], function (Model) {

    var Customer = Model.extend({

        forgotPassword: function (params) {

            this.makeRequest({

                method: 'POST',
                url: this.getProperty('baseUrl') + '/ss/customer/' + params.loginId + '/password',
                type: 'json',
                success_codes: [200, 201],
                error_codes: [400, 404, 500],
                data: {

                    loginId: params.loginId
                },

                success: function (data) {

                    params.success.call(params.context, data);
                },

                error: function (jqXHR) {

                    params.error.call(params.context, jqXHR);
                }
            });
        },

        register: function (params) {

            this.makeRequest({

                method: 'POST',
                url: this.getProperty('baseUrl') + '/ss/customer',
                type: 'json',
                success_codes: [200, 201],
                error_codes: [400, 404, 500],
                data: {

                    data: JSON.stringify(params.customerData)
                },

                success: function (data) {

                    params.success.call(params.context, data);
                },

                error: function (jqXHR) {

                    params.error.call(params.context, jqXHR);
                }
            });
        },

        getUserDetails: function (params) {

            this.makeRequest({

                method: 'GET',
                url: this.getProperty('baseUrl') + '/ss/customer/' + params.userId,
                type: 'json',
                success_codes: [200, 201],
                error_codes: [400, 404, 500],
                success: function (data) {

                    params.success.call(params.context, data);
                },

                error: function (jqXHR) {

                    params.error.call(params.context, jqXHR);
                }
            });
        },
        modify: function (params) {

            this.makeRequest({

                method: 'PUT',
                url: this.getProperty('baseUrl') + '/ss/customer',
                type: 'json',
                success_codes: [200, 201],
                error_codes: [400, 404, 500],
                data: {

                    data: JSON.stringify(params.data)
                },

                success: function (data) {

                    params.success.call(params.context, data);
                },

                error: function (jqXHR) {

                    params.error.call(params.context, jqXHR);
                }
            });
        }
    });

    return Customer;
});