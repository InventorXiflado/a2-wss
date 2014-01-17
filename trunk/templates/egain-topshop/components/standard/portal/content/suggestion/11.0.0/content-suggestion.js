define(['core/component'], function (BaseComponent) {

    var ContentSuggestionComponent = BaseComponent.extend({

        name: "content-suggestion",

        events: {
            "click .edit-suggestion-option": "prepareModifySuggestion",
            "click #modifysuggestion": "modifySuggestion"
        },

        prepare: function () {
            this.suggestionModel = this.getModel('suggestion');
            this.suggestionId = this.getProperty('suggestionId');
            this.suggestiontype = this.getProperty('suggestiontype');
            this.getSuggestionDetails();
        },

        getSuggestionDetails: function () {

            this.suggestionModel.getSuggestion({

                suggestionId: this.suggestionId,
                success: this._onGetSuggestionDetailsSuccess,
                error: this._onGetSuggestionDetailsError,
                context: this
            });
        },

        modifySuggestion: function (e) {

            var suggestion_content = {};
            suggestion_content.content = this.getContentFromTextArea();
            this.suggestionModel.modifySuggestion({

                suggestionId: this.suggestionId,
                data: suggestion_content,
                success: this._onModifySuggestionSuccess,
                error: this._onModifySuggestionError,
                context: this
            });

        },

        _onGetSuggestionDetailsSuccess: function (data) {

            this.processTssEventsForComments(data);
            this.render({

                suggestion: data.suggestion[0]
            });
            $('.egce-modal-wrap').css('width', '600px').css('height', '650px').css('text-align','left');
            $('.egce-modal-content').css('height', '100%').css('position','relative').css('overflow', 'auto');
            if (this.suggestiontype == 'pending') 
            	$('.edit-suggestion-option').toggle(true);
        },

        _onGetSuggestionDetailsError: function (data) {

            this.$('#errormsg').text(this.app.language.compileString("ERROR_REQUEST"));

        },

        _onModifySuggestionSuccess: function (data) {

            $('#pending').trigger('click');
            $('.egce-modal-close-button').trigger('click');

        },

        _onModifySuggestionError: function (data) {

            this.$('#errormsg').text(this.app.language.compileString("ERROR_REQUEST"));
            this.showHiddenElement('errormsgdiv');
            this.$('#errormsgdiv').wrap('<li />').parent().insertAfter('#listentry' + data.suggestionId);

        },

        processTssEventsForComments: function (data) {

            var suggestionEvents = data.suggestion[0].tssEvent;
            var numberOfComments = 0;
            for (var i = 0; i < suggestionEvents.length; i++) {

                //Event Type 2: Notes added, 3: To be modified by agent
                if (suggestionEvents[i].eventType == 2 || suggestionEvents[i].eventType == 3) {
                    suggestionEvents[i].comment = true;
                    suggestionEvents[i].createdDate = suggestionEvents[i].createdDate.substring(0, 11);
                    numberOfComments++;
                } else suggestionEvents[i].comment = false;
            }
            if (numberOfComments > 0) data.suggestion[0].commentspresent = true;

        },

        prepareModifySuggestion: function (e) {
            $('#modifysuggestion').removeClass('egce-invisible-element');
            var modifySuggestionHeight = $('#suggestioncontent')[0].offsetHeight;
            $('#suggestioncontent').replaceWith($('<textarea class="value egce-input-text egce-m10-top egce-rounded5 egce-p5" style="width:100%;" id="suggestioncontent">' + $('#suggestioncontent')[0].innerHTML.replace(/^\s+/, '') + '</textarea>'));
            $('#suggestioncontent').css('height' , modifySuggestionHeight)
        },

        getContentFromTextArea: function () {

            return this.$('#suggestioncontent')[0].value;

        } 

    });

    return ContentSuggestionComponent;
});