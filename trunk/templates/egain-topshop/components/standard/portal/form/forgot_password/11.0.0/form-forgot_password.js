define(['core/component', 
         'core/helpers'], 
    
function(CoreComponent, helpers) {

    var FormForgotPasswordComponent = CoreComponent.extend({

        name : 'form-forgot_password',

        events : {

            'submit form' : 'submitForm'
        },
        
        /**
            Checks first whether we're logged in or not. If we're not,
            show the main template showing the login form. If we are, 
            then just show the logout button.
        **/
        prepare : function() {
            
            this.customerModel = this.getModel('customer');

            this.render();
        },

        submitForm : function(e) {
            
            e.preventDefault();

            var $form = $(e.target);
            
            var loginId = $form.find('input[name="login-id"]').val();

            this.customerModel.forgotPassword({

                loginId : loginId,
                success : this._onForgotPasswordSuccess,
                error : this._onForgotPasswordError,
                context : this
            });
        },

        _onForgotPasswordSuccess : function() {
            
            alert('success');
        },

        _onForgotPasswordError : function(jqXHR) {
            
            alert('The specified login ID is not recognized.');
        }
    });

    return FormForgotPasswordComponent; 
});
