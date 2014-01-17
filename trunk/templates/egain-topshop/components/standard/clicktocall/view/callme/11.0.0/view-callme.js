 define(['core/component'], function(CoreComponent){

    var ViewCallmeComponent = CoreComponent.extend({

        name : 'view-callme',

        events : {
            'change select.country' : 'onSelectCountry',
            'click .call-me-button' : 'onSubmitForm',
            'keyup input.js-phone-number' : 'onPhoneNumberInputTyping',
            'click .close-button' : 'onCloseButtonClick', 
            'focus .text-background' : 'onTextFocus'
        },
        
        prepare : function() {
        	
        	this.phoneModel = this.getModel('phone');
        	this._countryName = "";
        	this._phoneNumber = "";
        	this.windowWidth = this.getProperty('window_width');
        	this.windowHeight = this.getProperty('window_height_precall');
        	
        	this.render();
        	window.resizeTo(this.windowWidth, this.windowHeight);
        },
                
        onSelectCountry : function(e) {
        	
        	var $select = $(e.target);
        	var countryCode = $select.val();
        	if (countryCode == 1) {
        		$(".us-or-cn").show();
				$("#us-phone1").focus();
				$(".international").hide();
				$("#int-phone").val('');
        	}
			else if (countryCode != -1)  {
				$(".us-or-cn").hide();
				$(".international").show();
				$("#internationalCode").val(countryCode);
				$("#int-phone").focus();
			}
        },

        onSubmitForm : function(e) {

            e.preventDefault();
            
            var time = $(".timedropdown").val();
            if (time == -1) {
            	alert(this.app.language.compileString("INVALID_TIME"));
				return false;
            }
            
            var countryCode = $(".country").val();
            this._countryName = $(".country :selected").text();
            
            if (countryCode == -1) {
            	alert(this.app.language.compileString("INVALID_COUNTRY"));
				return false;
            }

			var intPhone = $("#int-phone").val();
			var usPhone1 = $("#us-phone1").val();
			var usPhone2 = $("#us-phone2").val();
			var usPhone3 = $("#us-phone3").val();
			
			var dialNum;
			if (countryCode == "1") {
				dialNum = "00" + countryCode + usPhone1 + usPhone2 + usPhone3;
				this._phoneNumber = usPhone1 + "-" + usPhone2 + "-" + usPhone3;
			}
			else {
				dialNum = "00" + countryCode + intPhone;
				this._phoneNumber = countryCode + "-" + intPhone;
			}
			
			dialNum = this._removeNonDigitsFromPhoneNumber(dialNum);
		
			if (dialNum.length < 10) {
				alert(this.app.language.compileString("INVALID_PHONE_NUMBER"));
				return false;
			}
            
            $("#call-me-form").hide();
            this._showState(true, time);
            
            var accountId = this.page.getQueryString('aId');
			var sessionId = this.page.getQueryString('sId');
			var userId = this.page.getQueryString('uId');
			if(accountId && sessionId && userId)
				var visitorHistoryIds = {aId: accountId, sId: sessionId, uId: userId};
            
            this.phoneModel.callMe({
            	
            	dialNum : dialNum,
            	time : time,
            	countryCode : countryCode,
            	entryPointId : this.app.BASE_ARGUMENTS[0],
            	visitorHistoryIds : visitorHistoryIds,
            	success : this._onCallMeSuccess,
            	error : this._onCallMeError,
            	context : this           	
            });
        },
        
        _onCallMeSuccess : function(callStatus, delayTime) {
        	this._showState(callStatus, delayTime);
        },
        
        _onCallMeError : function(callStatus) {
        	this._showState(false);
        },
        
        _showState : function(callStatus, delayTime) {
        	
        	if (callStatus) {
        		
        		var message1 = this.app.language.compileString("NOW_WAIT_MESSAGE");
        		
	        	if (delayTime == 60 || delayTime == 180 || delayTime == 300)
					message1 = this.app.language.compileString("LATER_WAIT_MESSAGE");
					
				var message2 = this.app.language.compileString("MAY_CLOSE_WINDOW");
				
				var phoneImageSrc = this.getProperty('calling_image_src');
				this.$('.receiver-img').attr("src", phoneImageSrc);
				
        	} else {
        		
        		var message1 = this.app.language.compileString("CALL_FAILURE_MESSAGE");
        		var message2 = this.app.language.compileString("TRY_LATER");
        		
        		var phoneImageSrc = this.getProperty('call_me_image_src');
				this.$('.receiver-img').attr("src", phoneImageSrc);
        	}
        	
        	this.$('.state1').html(message1);
        	this.$('.state2').html(message2);
        	this.$('.country-name').html(this._countryName);
        	this.$('.phone-number').html(this._phoneNumber);
        	
        	$(".call-progress").show();
        	
        	this.windowHeight = this.getProperty('window_height_postcall');
        	window.resizeTo(this.windowWidth, this.windowHeight);
        },
        
        _removeNonDigitsFromPhoneNumber : function(phoneno) {
        	
			var formattedno;
			var unformatted_no_array;
			unformatted_no_array = phoneno.match(/\d+/g);
			formattedno = unformatted_no_array.join("");
			return formattedno;
		},
	
		onPhoneNumberInputTyping : function(e) {
			
			var $input = $(e.target);
			
			if($input.val().length === parseInt($input.attr('maxlength'))) {
				
				$input.next().focus();
			}
		},
		
		onCloseButtonClick : function() {
			
			window.open("", "_self", "");
			window.close();
		},
		
		onTextFocus : function(e) {
			var $input = $(e.target);
			$input.addClass("active");
		}
		
    });

    return ViewCallmeComponent;
});
