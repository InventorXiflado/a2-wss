 define(['core/component', 
         'core/helpers'], 
    
function(CoreComponent, helpers) {

    var FormContactUsComponent = CoreComponent.extend({

        name : 'form-contact_us',

        events : {

            'submit form' : 'submitForm',
            'focus .egce-js-placeholder' : 'onPlaceholderInputFocus',
            'blur .egce-js-placeholder' : 'onPlaceholderInputBlur'
        },
        
        /**
         * Prepare and render this component based on certain conditions.
         */
        prepare : function() {
            
        	// get necessary models
        	this.topicModel = this.getModel('topic');
            this.escalationModel = this.getModel('escalation');
        	
        	// 'noprompt' means we got redirected to 'contact_us' page after escalation avoidance search
            if(this.page.getQueryString('noprompt')) {

            	// get previously saved contact us data
            	var storedEscalationData = this.getState('contactUsData', null, true);
            	// if we cannot retrieve previously stored data, show an error
            	if($.isEmptyObject(storedEscalationData))
            	    this._submitError();
            	else // otherwise, submit the escalation
            		this._submitEscalation(storedEscalationData);

            } else { // we are rendering this component because the customer clicked "Contact Us" link
                
            	// log a 'commence escalation' event
            	this._startEscalation();
            	
                // we need to show available topics to the customer
            	this.topicModel.getRootTopics({

                    success: this._onTopicsArrive,
                    error : this._onTopicRequestError,
                    context : this
                });
            }
        },

        /** Renders the component on successful topics retrieval */
        _onTopicsArrive : function(data) {
            
            this.render({topics:data.topics});
        },
        
        /** Called in case of topics retrieval error */
        _onTopicRequestError : function() {
        	this.closeIfWithinModal();
            this.page.scrollToTop();
        },

        /**
         * Called when the user tries to submit escalation form.
         */
        submitForm : function(e) {
            
            e.preventDefault();
            // clear previously saved contact us data
            this.saveState('contactUsData', {}, true);
            var $form = $(e.target);
            var formValid = true;
            var emailValid = true;
            
            // read the form data and populate escalation data object
            var escalation_data = {
                customerName  : $form.find('input[name="name"]').val(),
                customerEmail : $form.find('input[name="email"]').val(),
                subject : $form.find('input[name="subject"]').val(),
                body : $form.find('textarea').val(),
                url : window.location.href,
                topicId : $form.find('select').val()
            };
            
            if (escalation_data.customerName == this.app.language.compileString("NAME") ||($.trim(escalation_data.customerName) == '')) {
				formValid = false;
			}
			else if (escalation_data.customerEmail == this.app.language.compileString("EMAIL_ADDRESS") ||($.trim(escalation_data.customerEmail) == '')) {
				formValid = false;
			}
			else if(!this.app.validateEntry(escalation_data.customerEmail,"emailaddress")){
				emailValid = false;
			}
			else if (escalation_data.body == this.app.language.compileString("MESSAGE") ||($.trim(escalation_data.body)== '')) {
				formValid = false;
			}
            
			if (formValid && emailValid) 
			{
	            /* if 'show suggested articles before escalation' or 'show community posts before escalation' is
	             * set to true in this portal, perform an escalation avoidance search */
	            if(this.app.getPortalSetting("showSuggestedArticlesBeforeEscalation") ||
	               this.app.getPortalSetting("enableEscalationShowSuggestedArticles") ||
	               this.app.getPortalSetting("enableCommunityPostsBeforeAllowEscalation")) {
	            	
	            	// save escalation data
	                this.saveState('contactUsData', escalation_data, true);
	            	this.navigateToPage('search', escalation_data.subject,  {'escalationAvoidance': 1}); 
		
		            this.closeIfWithinModal();
		            this.page.scrollToTop();
	            }
	            else { // submit this escalation
	            	this._submitEscalation(escalation_data);
	            }
		    }
			else {
				if(!emailValid){
					window.alert(this.app.language.compileString("INVALID_EMAIL_CONTACT_US_FORM"));
				}
				else{
				 window.alert(this.app.language.compileString("INCOMPLETE_CONTACT_US_FORM"));
				}
				return;
	         }
        },
        
        /** Submits the escalation data to the server */
        _submitEscalation : function(escData) {
        	
        	delete escData.topicId; // topic ID is not needed for escalation submission
        	this.escalationModel.submitEscalation({
        		data : escData,
                success : this._submitSuccess,
                error : this._submitError,
                context : this
        	});
        },
        
        /** Submits a 'commence escalation' request to the server. */
        _startEscalation : function() {
        	
        	this.escalationModel.startEscalation({
                
        		context : this
                // there are no success/error handlers because there is no action required,
                // this API call just logs a 'commence escalation' event
        	});
        },
        
        /** On successful submission show "thank you" message to the user. */
        _submitSuccess : function() {
           
            this.$el.html(this.compileTemplate('sent'));
        },

        /** Shows error message to the user */
        _submitError : function() {

            this.$el.html(this.compileTemplate('error'));
        }
    });

    return FormContactUsComponent; 
});
