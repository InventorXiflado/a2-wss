 define(['core/component',
     'core/helpers'],

 function (CoreComponent, helpers) {

     var MyProfileComponent = CoreComponent.extend({

         name: 'form-myprofile',

         events : {

             'focus input.egce-input-text': 'onInputAttributeFocus',
             'blur input.egce-input-text': 'onInputAttributeBlur',
             'submit form': 'submitForm'
         },

         prepare : function () {

             this.customerModel = this.getModel('customer');
             this.fetchUserDetails();
         },

	 /* 
	  * This function is called when the user submits the form after editing her details
	  * The form is submitted if all the required fields are entered and all entries are valid.
	  */	  
         submitForm : function (e) {

             e.preventDefault();
             this.$('.egce-warning-text').toggle(false);

             var $form = $(e.target);
             var mandatoryElements = this.$('.mandatory-form-input');
             var doNotSubmit = false;

             //Check if Password or Confirm password has been enetered and make sure they match before continuing.
             if (/\S/.test(this.$('#loginPassword')[0].value) || /\S/.test(this.$('#confirmPassword')[0].value)) {
                 if ((this.$('#loginPassword')[0].value) != (this.$('#confirmPassword')[0].value)) {
                     doNotSubmit = true;
                     this.$('#invalidentryconfirmPassword').text(this.app.language.getString('PASSWORDS_MATCH_ERROR'));
                     this.$('#invalidentryconfirmPassword').toggle(true);
                 }
             }
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
                 var userId = this.getState('userId', null, true);
                 var customerData = {

                     loginId: loginId,
                     contactPersonId: userId

                 };

                 var customerAttributes = this.app.PORTAL_SETTINGS.customerProfileAttributes.attribute.slice();
                 customerAttributes.push({
                     name: "loginPassword"
                 });
                 for (var i = 0; i < customerAttributes.length; i++) {
                     var attributeName = customerAttributes[i].name;
                     if (this.$('#' + attributeName).attr('readonly') != 'readonly') {
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

             }

             if (!doNotSubmit) {
                 this.showLoadingImage('myprofileform');
                 this.customerModel.modify({

                     data: customerData,
                     success: this._onModifySuccess,
                     error: this._onModifyError,
                     context: this
                 });
             }

         },
	
	 /* 
	 * This function fetches the details of the user and calls the function to populate the details in the form if all is successful
	 */	
         fetchUserDetails : function () {

             this.customerModel.getUserDetails({

                 userId: this.getState('userId', null, true),
                 success: this._onFetchUserDetailsSuccess,
                 error: this._onFetchUserDetailsError,
                 context: this
             });
         },

	 /* 
	 * This function displays the attributes on screen which are either editable or have been entered by the user.
	 */	 
         _onFetchUserDetailsSuccess : function (data) {

             //Copy the array into the new variable
             var showAttributes = this.app.PORTAL_SETTINGS.customerProfileAttributes.attribute.slice();
             //If the property is not editable or has not been entered by the user, do not display it.
             for (var i = 0; i < showAttributes.length; i++) {

                 var attribName = showAttributes[i].name;
                 if (!(data.customer[0].hasOwnProperty(attribName) || showAttributes[i].editable)) {
                     showAttributes.splice(i, 1);
                     i--;
                 }

             }

             //login id, password, confirm password have to be added to the attributes.
             var loginAttribObj = {

                 name: "loginId",
                 editable: false,
                 mandatory: true
             }

             var passwordAttribObj = {

                 name: "loginPassword",
                 editable: true,
                 mandatory: false
             }

             var confirpasswordAttribObj = {

                 name: "confirmPassword",
                 editable: true,
                 mandatory: false
             }

             showAttributes.unshift(confirpasswordAttribObj);
             showAttributes.unshift(passwordAttribObj);
             showAttributes.unshift(loginAttribObj);

             this.render({

                 attributes: showAttributes

             });
             this.showInstructions();
             this.$('.egce-warning-text').toggle(false);

             this.$('#loginPassword').replaceWith('<input class="egce-input-text egce-font-medium" type="password" name="loginPassword" id="loginPassword" />');
             this.$('#confirmPassword').replaceWith('<input class="egce-input-text egce-font-medium" type="password" name="confirmPassword" id="confirmPassword" />');
	     //First attribute should not have a margin at top
	     this.$('#grouploginId').css('margin-top','0');
             this._showCustomerDetails(data.customer[0], showAttributes);

         },
         
	 /* 
	 * This function displays the fetched user deails in the corresponding input boxes.
	 * It also applies the readonly property to the non-editable attributes of the user.
	 */
         _showCustomerDetails: function (customerDetails, showAttributes) {

             for (var i = 0; i < showAttributes.length; i++) {
                 var attribName = showAttributes[i].name;
                 if (customerDetails.hasOwnProperty(attribName)) {
                     var attribValue = customerDetails[attribName];
                     if (attribName == 'dateOfBirth') {
                         dateObj = window.app.parseServerDate(attribValue)
                         attribValue = dateObj.getDate() + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();
                     }
                     this.$('#' + attribName).val(attribValue);
                     if (showAttributes[i].editable) {
                         //This is to done because we need to make sure no mandatory and editable element is empty
                         if (showAttributes[i].mandatory) 
                         	this.$('#' + attribName).addClass('mandatory-form-input');
                     } else {
                         this.$('#' + attribName).attr('readonly', 'readonly');
                         // To skip read-only when tab is pressed.
                         this.$('#' + attribName).attr('tabindex', '-1');
                         $(this.$('#' + attribName)[0].parentElement).addClass('noneditable-attribute-div');
                     }
                 }
             }
         },

	 /* 
	 * Displays the success message on screen when the details entered by the user are successfully updated on server.
	 */	 
         _onModifySuccess : function (data) {
             this.hideLoadingImage();
             this._onFetchUserDetailsSuccess(data);
             this.$('.edit-result-notification').toggle(true);
             this.$('.edit-result-notification').html(this.app.language.getString('EDIT_SUCCESSFUL'));
         },

	 /* 
	 * Displays the error message on screen if details update call fails.
	 */         
         _onModifyError : function (data) {
             this.hideLoadingImage();
             this.$('.edit-result-notification').toggle(true);
             this.$('.edit-result-notification').html(this.app.language.getString('ERROR_REQUEST'));
         },
         
         /*
         * This function displays the instructions for My Profile page.
         * This is done seperately to avoid instructions being indexed by search indexers and to format before displaying them.
         */
         showInstructions : function () {
         	
         	var myProfileInstruction = this.app.language.getString('MY_PROFILE_INSTRUCTIONS');
         	var buttonName = this.app.language.getString('SAVE')
         	myProfileInstruction = helpers.makePartStringBold(myProfileInstruction , buttonName);
         	this.$('.general-instructions').html(myProfileInstruction);
         	this.$('.mandatory-instructions').html(this.app.language.getString('MANDATORY_INSTRUCTION'));         
         },

	 /* 
	 * Displays the spinner to notify the user to wait while processing completes.
	 */ 
         showLoadingImage : function (targetDivId) {

             var opts = {

                 lines: 10, // The number of lines to draw
                 length: 3, // The length of each line
                 width: 2, // The line thickness
                 radius: 6, // The radius of the inner circle
                 rotate: 0, // The rotation offset
                 color: '#aaa', // #rgb or #rrggbb
                 speed: 1.3, // Rounds per second
                 trail: 60, // Afterglow percentage
                 shadow: false, // Whether to render a shadow
                 hwaccel: false, // Whether to use hardware acceleration
                 className: 'spinner' // The CSS class to assign to the spinner
             };

             var target = document.getElementById(targetDivId)
             this.spinner = new Spinner(opts).spin(target);

         },

	 /* 
	 * Hides the waiting spinner once processing is done.
	 */ 
         hideLoadingImage : function () {

             this.spinner.stop();

         },

	 /* 
	 * Highlights the active input element.
	 */ 
         onInputAttributeFocus : function (e) {

             $(e.target).parent().addClass('active');
         },

         onInputAttributeBlur : function (e) {

             $(e.target).parent().removeClass('active');
         }

     });

     return MyProfileComponent;
 });