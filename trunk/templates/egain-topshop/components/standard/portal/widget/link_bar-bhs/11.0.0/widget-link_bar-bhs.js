 define(['core/component'], function(CoreComponent){

    var WidgetLink_barComponent = CoreComponent.extend({

        name : 'widget-link_bar',

        events : {

            'click .js-contact-us' : 'onContactUsClick'
        },

        prepare : function() {

        	// only show "Contact Us" link if it's a customer portal AND 'enableEscalationToEmail' is set to true in portal configuration
            var isEnableEscalationToEmail = !this.app.isAgentPortal() && this.app.getPortalSetting("enableEscalationToEmail");

        	this.render({
                showContactUsLink : isEnableEscalationToEmail
            });
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
        },

        onContactUsClick : function() {

            var _this = this;

            //send trace to table that user seek contact
			$.ajax({
				type : "POST",
				data : {
					sid : this._getSessionId(),
					articleId : 0,
					portalId : this.app.getPortalId(),
					articleName : "Footer contact us link"
				},
				url : "/system/web/emea/setContactUsData.jsp",
				dataType : "xml",
				success : function(data){ },
			});

            // hard-coded values for backward compatibility
            var topicModelId = 4;
            var escalationModelId = 13;
            try {
            	/* If one of the models is not in the manifest, then none are.
            	 * So it's safe to try getting them in the same try/catch. */
            	topicModelId = this.getModel('topic').id;
            	escalationModelId = this.getModel('escalation').id;
            }
            catch(e) {
                // Do nothing, we are already using default values
            }

            this.app.page.createComponent({

                name : 'standard.portal.form.contact_us-bhs',
                models : {
                    'topic' : {id:topicModelId},
                    'escalation' : {id:escalationModelId}
                }

            }, function(component) {

                _this.app.page.showModal({

                    component : component
                });
            });
        }
    });

    return WidgetLink_barComponent;
});


