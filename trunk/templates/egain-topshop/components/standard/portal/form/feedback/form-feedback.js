define(['core/component', 'core/models/session', 'core/models/feedback'],

function(CoreComponent, Session, Feedback){

    var FormFeedbackComponent = CoreComponent.extend({

        name : 'form-feedback',
        events : {

            'submit form' : 'submitForm'
        },

        prepare : function() {

            (new Session).loginGH();

            this.render();
        },

        submitForm : function(e) {

            var $form = $(e.target); 

            e.preventDefault();

            (new Feedback).submit({

                feedback : $form.find('textarea').val(),
                success: this.submitSuccess,
                context: this
            });
        },

        submitSuccess : function() {

            
        }
    });

    return FormFeedbackComponent; 
});
    
    
