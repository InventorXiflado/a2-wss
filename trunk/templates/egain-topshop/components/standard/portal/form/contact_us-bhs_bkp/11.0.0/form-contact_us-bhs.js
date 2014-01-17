 define(['core/component',
         'core/helpers'],

function(CoreComponent, helpers) {

    var FormContactUsComponent = CoreComponent.extend({

        name : 'form-contact_us',
		tform : null,
        events : {

            'submit form' : 'submitForm',
            'focus .egce-js-placeholder' : 'onPlaceholderInputFocus',
            'blur .egce-js-placeholder' : 'onPlaceholderInputBlur',
            'change #select_top' : 'onTopQuestionChange'
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


            	var $form = $(e.target);
            	tform = $form;
            	//$(tform.configId).val(this.app.getPortalId());
            	$(tform).find('input[name="configId"]').val(this.app.getPortalId());

            	$(tform).find('input[name="xEgainSessionId"]').val(this._getSessionId());
				$(tform).find('input[name="subject"]').val($form.find('select[name="select_top"] option:selected').text());

			var valueOfQuestion1 = $form.find('select[name="select_top"] option:selected').val();

            // read the form data and populate escalation data object
            var escalation_data = {
				questionTop	  : $form.find('select[name="select_top"] option:selected').val(),
				questionSupport	: $form.find('#' + valueOfQuestion1).find('select option:selected').val(),
				orderNumber  : $form.find('input[name="order_number"]').val(),
				rmaNumber  : $form.find('input[name="rma_number"]').val(),
				nameTitle  : $form.find('select[name="name_title"] option:selected').val(),
				firstName  : $form.find('input[name="first_name"]').val(),
				lastName  : $form.find('input[name="last_name"]').val(),
				houseNumberStreet  : ($form.find('input[name="house_number_street"]').val() == this.app.language.compileString("CU_HOUSE_NUMBER_STREET") ? "": $form.find('input[name="house_number_street"]').val()) ,
				address2  : ($form.find('input[name="address_2"]').val() == this.app.language.compileString("CU_ADDRESS_2") ? "": $form.find('input[name="address_2"]').val()) ,
				postCode  : $form.find('input[name="post_code"]').val(),
				contactNumber  : $form.find('input[name="contact_number"]').val(),
				contactPreference  : $form.find('select[name="contact_preference"] option:selected').val(),
				topicId  : $form.find('select[name="pick_a_topic"] option:selected').val(),
                customerEmail : $form.find('input[name="email"]').val(),
                body : $form.find('textarea').val(),
                url : window.location.href,
                subject : $form.find('#' + valueOfQuestion1).find('select option:selected').text(),
                attachment: $form.find('input[name="datafile"]').val()
            };
            //
            if(escalation_data.questionTop==""){
				escalation_data.subject = escalation_data.body;
			}
			var formatted_message_string = "\n-------------------- FORM DATA ----------------------------\n" +
				"What is your query regarding: " + $form.find('select[name="select_top"] option:selected').text() + "\n" +
				"Contact reason: " + $form.find('#' + valueOfQuestion1).find('select option:selected').text() + "\n" +
				"Order Number: " + escalation_data.orderNumber + "\n" +
				"RMA Number: " + escalation_data.rmaNumber + "\n" +
				"Please choose a title: " + escalation_data.nameTitle + "\n" +
				"First Name: " + escalation_data.firstName + "\n" +
				"Last Name: " + escalation_data.lastName + "\n" +
				"House Number and Street: " + escalation_data.houseNumberStreet + "\n" +
				"Address 2: " + escalation_data.address2 + "\n" +
				"Postcode: " + escalation_data.postCode + "\n" +
				"Phone number: " + escalation_data.contactNumber + "\n" +
				"Customer Email: " + escalation_data.customerEmail + "\n" +
				"Contact Preference: " + escalation_data.contactPreference + "\n" +
				"----------------------------------------------------------\n";
			escalation_data.body = escalation_data.body + formatted_message_string;
/*
			alert("questionTop[" + escalation_data.questionTop +
				"]\n questionSupport["+escalation_data.questionSupport+
				"]\n orderNumber["+escalation_data.orderNumber+
				"]\n rmaNumber["+escalation_data.rmaNumber+
				"]\n nameTitle["+escalation_data.nameTitle+
				"]\n firstName["+escalation_data.firstName+
				"]\n lastName["+escalation_data.lastName+
				"]\n houseNumberStreet["+escalation_data.houseNumberStreet+
				"]\n address2["+escalation_data.address2+
				"]\n postCode["+escalation_data.postCode+
				"]\n contactNumber["+escalation_data.contactNumber+
				"]\n contactPreference["+escalation_data.contactPreference+
				"]\n topicId["+escalation_data.topicId+
				"]\n customerEmail["+escalation_data.customerEmail+
				"]\n subject["+escalation_data.subject+
				"]\n body["+escalation_data.body+ "]");
*/
            if (escalation_data.customerEmail == this.app.language.compileString("EMAIL_ADDRESS") ||($.trim(escalation_data.customerEmail) == '')) {
				formValid = false;
			}
			else if(!this.app.validateEntry(escalation_data.customerEmail,"emailaddress")){
				emailValid = false;
			}
			else if (escalation_data.orderNumber == this.app.language.compileString("CU_ORDER_NUMBER") ||($.trim(escalation_data.orderNumber) == '')) {
				formValid = false;
			}
			else if (escalation_data.nameTitle == this.app.language.compileString("CU_PLEASE_SELECT_A_TITLE") ||($.trim(escalation_data.nameTitle) == '')) {
				formValid = false;
			}
			else if (escalation_data.firstName == this.app.language.compileString("CU_FIRST_NAME") ||($.trim(escalation_data.firstName) == '')) {
				formValid = false;
			}
			else if (escalation_data.lastName == this.app.language.compileString("CU_LAST_NAME") ||($.trim(escalation_data.lastName) == '')) {
				formValid = false;
			}
			else if (escalation_data.postCode == this.app.language.compileString("CU_POST_CODE") ||($.trim(escalation_data.postCode) == '')) {
				formValid = false;
			}
			else if (escalation_data.contactNumber == this.app.language.compileString("CU_CONTACT_NUMBER") ||($.trim(escalation_data.contactNumber) == '')) {
				formValid = false;
			}
			else if (escalation_data.contactPreference == this.app.language.compileString("CU_PLEASE_SELECT") ||($.trim(escalation_data.contactPreference) == '')) {
				formValid = false;
			}
			else if (escalation_data.body == this.app.language.compileString("MESSAGE") ||($.trim(escalation_data.body)== '')) {
				formValid = false;
			}
			else if (escalation_data.questionTop == this.app.language.compileString("CU_WHAT_IS_THE_QUERY_REGARDING") ||($.trim(escalation_data.questionTop)== '')) {
				formValid = false;
			}
			else if (escalation_data.questionSupport == this.app.language.compileString("CU_WHAT_WOULD_YOU_LIKE_TO_KNOW") ||($.trim(escalation_data.questionSupport)== '')) {
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



        	//if attachment is supplied we post to jsp for file upload
        	//otherwise we use standard templates functionality
     		if(escData.attachment.length > 0){
     			//alert("attachment " + escData.attachment.length);
				var reattach_form = $("<div/>").css({display: "none", width: "0", height: "none"});
				reattach_form.append(tform).appendTo(".right.section");
				$(tform).children().find("textarea[name='description']").val(escData.body);

				var iframe = document.createElement("iframe");
				iframe.setAttribute("id", "upload_iframe");
				iframe.setAttribute("name", "upload_iframe");
				iframe.setAttribute("width", "0");
				iframe.setAttribute("height", "0");
				iframe.setAttribute("border", "0");
				iframe.setAttribute("style", "width: 0; height: 0; border: none;");

				$("body #upload_iframe").remove();
				// Add to document...
				$("body").append(iframe);
				window.frames['upload_iframe'].name = "upload_iframe";

				$("#upload_iframe").load(function(){
					//alert("loaded");
				});


				// Set properties of form...
				$(tform).attr("target", "upload_iframe");
				$(tform).attr("action", "/system/web/emea/upload.jsp");
				$(tform).attr("method", "post");
				$(tform).attr("enctype", "multipart/form-data");
				$(tform).attr("encoding", "multipart/form-data");

				// Submit the form...
				$(tform).submit();
				tform = null;
			}


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
        },
        onTopQuestionChange : function(e){
			var selectedId = $("#select_top option:selected").val();
			if(selectedId==""){
				$("#support_que div").hide();
				$("#support_que div:first").show().children(":first").attr("disabled", "true").css("backgroundColor", "#eeeeee");
				return;
			}
			$("#support_que div").hide();
			$("#"+ selectedId).children(":first").removeAttr("disabled").css("backgroundColor", "#ffffff").end().show();
		},
        _getSessionId : function() {

            if(window.app) {

                var sessionIdStr = window.app.sessionId || window.app.getSSOSessionId();
                if (!sessionIdStr) {
                    sessionIdStr = window.app.getQs("WS_UUID");
                    if (sessionIdStr) {
                        this._saveSessionId(sessionIdStr);
                        window.app.qs["WS_UUID"] = null;
                    }
                }

                if (!sessionIdStr) {
                   sessionIdStr =  $.cookie('sessionId');
                }
                return sessionIdStr;
            }
        }
    });

    return FormContactUsComponent;
});
