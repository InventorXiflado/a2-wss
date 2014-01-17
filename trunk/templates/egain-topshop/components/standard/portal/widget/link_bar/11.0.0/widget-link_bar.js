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
        
        onContactUsClick : function() {

            var _this = this;
            
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
                
                name : 'standard.portal.form.contact_us',
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
    
    
