define(['core/component'], function(CoreComponent){

    var FormEmailFriendComponent = CoreComponent.extend({

        name : 'form-email_friend',

        events : {

            'submit form' : 'onFormSubmit',
            'focus .egce-js-placeholder' : 'onPlaceholderInputFocus',
            'blur .egce-js-placeholder' : 'onPlaceholderInputBlur'
        },

        prepare : function() {

            this.render();
        },

        onFormSubmit : function(e) {

            e.preventDefault();

            //Save the form object.
            var $form = $(e.target);

            var sender_name = $form.find('input[name="sender_name"]').val();
            var sender_email = $form.find('input[name="sender_email"]').val();
            var receiver_name = $form.find('input[name="receiver_name"]').val();
            var receiver_email = $form.find('input[name="receiver_email"]').val();
            var comments = $form.find('textarea').val();

            this.emailModel = this.getModel('email');

            //Send the email
            this.emailModel.send({

                fromName : sender_name,
                toName : receiver_name,
                fromEmail : sender_email,
                toEmail : receiver_email,
                articleId : this.getProperty('articleId'),
                message : comments,
                success : this._onEmailSendSuccess,
                error : this._onEmailSendError,
                context : this
            });
        },

        _onEmailSendSuccess : function() {

            var html = this.compileTemplate('success');

            this.$el.html(html);
        },

        _onEmailSendError : function() {

            this.$('.error').show();
        },

        onInputFocus : function(e) {

            $(e.target).val('');
        }
    });

    return FormEmailFriendComponent;
});
