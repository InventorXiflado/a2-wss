define(['core/component', 'core/helpers'], 
    
function(CoreComponent, helpers) {

    var FormLoginComponent = CoreComponent.extend({

        name : 'form-login',

        events : {

            'focus input.egce-js-placeholder' : 'onPlaceholderInputFocus',
            'blur input.egce-js-placeholder' : 'onPlaceholderInputBlur',
            'submit form' : 'submitForm',
            'click a.reset' : 'reset'
        },
        
        /**
            Checks first whether we're logged in or not. If we're not,
            show the main template showing the login form. If we are, 
            then just show the logout button.
        **/
        prepare : function() {
            
            this.sessionModel = this.getModel('session');

            var showSignUpLink = !this.app.isAgentPortal() &&
                                 this.app.getPortalSetting('enableAuthenticationSignUpNowOption');

            var showForgotPasswordLink = !this.app.isAgentPortal() &&
                                        this.app.getPortalSetting('enableAuthenticationForgotYourPasswordOption');
            this.render({

                showSignUpLink : showSignUpLink,
                showForgotPasswordLink : showForgotPasswordLink
            });
        },


        /**
         * This function is called on login form submission when a user
         * clicks "Log In" button.
         */
        submitForm : function(e) {
            
            e.preventDefault();

            var $form = $(e.target);
        
            var data = {

                username : $form.find('#username').val(),
                password : $form.find('#password').val(),
                $debug : false
            };

            //Login to the session.
            this.sessionModel.login({
                
                data : data,
                success : this._onLoginSuccess,
                error : this._onLoginError,
                context : this
            });
        },

        /**
         * Called when login operation is successful.
         */
        _onLoginSuccess : function(data, textStatus, jqXHR) {
        	        	
        	// capture the new session Id
        	this.sessionModel._captureSessionId(jqXHR);
        	var userId = data.authInfo.contactPersonId;
        	this.saveState('userId', userId, true);
        	
        	// Save authentication state in case of a customer portal 
        	if(!window.app.isAgentPortal()) {
	        	this.saveState('isAuthCustomer', data.authInfo.isAuthenticated, true);
        	}
        	
        	// save the user name to be used in the header (user greeting)
        	this.saveState('userName', data.username, true);
        	
        	// read the next page path from the current url
        	// e.g. ?next=agent/portal/1000/topic/1000/Home-Appliances
        	var next = this.page.getQueryString('next') || this.app.getPageUrl('homepage');

            $(this.el).html('Login is successful!');
        
            // navigate to the next page (the page the user was at
            // when they got redirected to login page)
            this.navigate(next, {trigger:true});
        },

        _onLoginError : function(data) {

        	// read the error message returned by the server
        	var serverResponseText = JSON.parse(data.responseText);
        	var serverErrorMsg = serverResponseText.callInfo.message;
        	
        	/* if the user is not allowed to login because of a lack of license or hitting the max license limit,
        	 * show corresponding error message */
        	var userErrorMsg;
        	if (serverErrorMsg.indexOf("License not assigned") != -1) {
        		userErrorMsg = this.app.isAgentPortal() ? 
        			this.app.language.getString('INVALID_LICENSE') : 
        			this.app.language.getString('SERVER_BUSY');
        	}
        	else {
        		// show the usual "wrong credentials" message
        		userErrorMsg = this.app.language.getString('LOGIN_FAILED');
        	}
        	
        	this.$("#errormsg").html(userErrorMsg);
        	this.$('.egce-login-error-msg').show();
        },

        reset : function() {

            this.render();
        },

        _onLoginStatusSuccess : function(isLoggedIn) {

            
        },

        _onLoginStatusError : function() {


        },

        onPlaceholderInputFocus : function(e) {

            if ($(e.target).val() == $(e.target).data('placeholder')) {
                $(e.target).val('');
            }
            $(e.target).parent().addClass('active');
        },

        onPlaceholderInputBlur : function(e) {

            if ($(e.target).val() == '') {
                $(e.target).val($(e.target).data('placeholder'));
            }
            $(e.target).parent().removeClass('active');
        }
    });

    return FormLoginComponent; 
});
