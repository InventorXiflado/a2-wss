 define(['core/component', 
         'core/helpers'], 
    
function(CoreComponent, helpers) {

    var FormSignupComponent = CoreComponent.extend({

        name : 'form-contact_us',

        events : {

             'focus input.egce-input-text': 'onInputAttributeFocus',
             'blur input.egce-input-text': 'onInputAttributeBlur',
            'submit form' : 'submitForm',
            'click a.reset' : 'reset'
        },
        
        prepare : function() {
            
            this.customerModel = this.getModel('customer');

             var showAttributes = this.app.PORTAL_SETTINGS.customerProfileAttributes.attribute.slice();
             var loginAttribObj = {

                 name: "loginId",
                 editable: false,
                 mandatory: true
             };
             showAttributes.unshift(loginAttribObj);

             this.render({

                 attributes: showAttributes
             });
             this.showInstructions();
             this.$('.egce-warning-text').toggle(false);
        },

	 /* 
	  * This function is called when the user submits the form after filling out the sign up form.
	  * The form is submitted if all the required fields are entered and all entries are valid.
	  */	  
        submitForm : function(e) {
            
            e.preventDefault();
             this.$('.egce-warning-text').toggle(false);

            var $form = $(e.target);
             var mandatoryElements = this.$('.mandatory-form-input');
             var doNotSubmit = false;
             for (var i = 0; i < mandatoryElements.length; i++) {
                 var inputValue = mandatoryElements[i].value;
                 if (!/\S/.test(inputValue)) {
                     doNotSubmit = true;
                     this.$('#emptywarn' + mandatoryElements[i].name).toggle(true);
                     this.$('#emptywarn' + mandatoryElements[i].name).html(this.app.language.getString('EMPTY_WARNING'));
                 }

             }
             if (!doNotSubmit) {
                 var loginId = $form.find('input[name="loginId"]').val();
                 var customerData = {

                     loginId: loginId
                 };

                 var customerAttributes = this.app.PORTAL_SETTINGS.customerProfileAttributes.attribute;
                 for (var i = 0; i < customerAttributes.length; i++) {

                     var attributeName = customerAttributes[i].name;
                     var attributeValue = $form.find('input[name=' + attributeName + ']').val()
                     if (/\S/.test(attributeValue)) {
                         var validEntry = true;
                         if (attributeName == 'dateOfBirth') {
                             validEntry = window.app.validateEntry(attributeValue, 'date');
                             if (validEntry) {
                                 dateBits = attributeValue.split('/');
                                 attributeValue = window.app.parseDateObj(new Date(dateBits[2], dateBits[1] - 1, dateBits[0]));
                             }
                         } else if (attributeName == 'emailAddress') validEntry = window.app.validateEntry(attributeValue, 'emailaddress');
                         if (validEntry) {

                             customerData[attributeName] = attributeValue;
                         } else {
                             doNotSubmit = true;
                             this.$('#invalidentry' + attributeName).toggle(true);
                             this.$('#invalidentry' + attributeName).html(this.app.language.getString('INVALID_ENTRY'));
                         }
                     }
                 }
             }

             //Submit register request only if mandatory elements are filled and all entries are valid
             if (!doNotSubmit) this.customerModel.register({

                 customerData: customerData,
                success : this._onRegisterSuccess,
                 error: this._onRegisterError,
                 context: this
            });
            
         },
         
            /*
         * This function displays the instructions for My Profile page.
         * This is done seperately to avoid instructions being indexed by search indexers and to format before displaying them.
         */
         showInstructions : function () {
                
         	var signupInstruction = this.app.language.getString('SIGN_UP_INSTRUCTIONS');
         	var buttonName = this.app.language.getString('SIGN_UP_BUTTON')
         	signupInstruction = helpers.makePartStringBold(signupInstruction , buttonName);
         	this.$('.general-instructions').html(signupInstruction);
         	this.$('.mandatory-instructions').html(this.app.language.getString('MANDATORY_INSTRUCTION'));         
        },

	 /* 
	 * Displays the success message on screen if the new customer is successfully created.
	 */   
        _onRegisterSuccess : function() {
            
             this.$el.html(this.compileTemplate('signup-result'));
             this.$('#signup-result-message').html(this.app.language.getString('SIGNUP_SUCCESS_MESSAGE'));
        },

	 /* 
	 * Displays the error message on screen if sign up fails.
	 */   
        _onRegisterError : function() {
            
             this.$el.html(this.compileTemplate('signup-result'));
             this.$('#signup-result-message').html(this.app.language.getString('ERROR_REQUEST'));
        },

        reset : function() {

            this.render();
        },

         onInputAttributeFocus: function (e) {
            
             $(e.target).parent().addClass('active');
        },

         onInputAttributeBlur: function (e) {

             $(e.target).parent().removeClass('active');
         }

    });

    return FormSignupComponent; 
});
