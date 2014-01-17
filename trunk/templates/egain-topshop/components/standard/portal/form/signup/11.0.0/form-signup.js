 define(['core/component', 
         'core/helpers'], 
    
function(CoreComponent, helpers) {

    var FormSignupComponent = CoreComponent.extend({

        name : 'form-contact_us',

        events : {

            'submit form' : 'submitForm',
            'click a.reset' : 'reset'
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
            var emailAddress = $form.find('input[name="email-address"]').val();
            var firstName = $form.find('input[name="first-name"]').val();
            var lastName = $form.find('input[name="last-name"]').val();

            this.customerModel.register({

                loginId : loginId,
                firstName : firstName,
                lastName : lastName,
                emailAddress : emailAddress,
                success : this._onRegisterSuccess,
                error : this._onRegisterError
            });
            
            /*
            //Login to the session.
            this.app.session.login({
                
                data : data,
                success : this._onLoginSuccess,
                error : this._onLoginError,
                context : this
            });
            */
        },

        _onRegisterSuccess : function() {
            
            //Default value for the next page is the homepage
            //var next = helpers.getUrlParameter('next', '/');

            var next = this.page.getQueryString('next') || this.app.getPageUrl('homepage');

            $(this.el).html('Login is successful!');
        
            //Navigate the application into the next page.
            this.navigate(next, {trigger:true});
        },

        _onRegisterError : function() {
            
            $(this.el).html(this.getTemplate('error'));
        },

        reset : function() {

            this.render();
        },

        _onLoginStatusSuccess : function(isLoggedIn) {

            
        },

        _onLoginStatusError : function() {


        }
    });

    return FormSignupComponent; 
});
