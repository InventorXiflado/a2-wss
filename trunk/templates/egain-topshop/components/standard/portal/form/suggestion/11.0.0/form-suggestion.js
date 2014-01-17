 define(['core/component'],
        
    function(CoreComponent){

    /**
     * This component is used to submit an article suggestion through SS portal (via 'Make a suggestion' link)
     */
    var FormSuggestionComponent = CoreComponent.extend({

        name : 'form-suggestion',

        events : {

            'submit form' : 'submitForm'  // form submission
        },
        
        /**
         * Renders the component.
         */
        prepare : function() {
        	
        	this.render();
        },

        /**
         * This function is triggered on the form submission when "Suggest" button is clicked.
         */
        submitForm : function(e) {

            e.preventDefault();
             
            var value_array = $(e.target).serializeArray();
            var suggestion_data = {};
            
            // iterate over the array of form entries, make sure none of them are empty, and store them in an object 
            // for json request submission
            for ( var i = 0; i < value_array.length; i++) {
				var fieldValue = value_array[i].value;
                var fieldName = value_array[i].name;
				    // Validating user input: The user input
					// value should neither be blank nor be same as the default
					// value for the fields.
					if ((fieldName=="article.name" && (!fieldValue || (fieldValue == this.app.language.compileString("SUGGEST_NAME"))))
						|| (fieldName == "article.content" && (!fieldValue ||  (fieldValue == this.app.language.compileString("SUGGEST_CONTENT_PROMPT"))))) 
					 {
						alert(this.app.language.compileString("SUGGEST_EMPTY_FIELD"));
						return;
					} else {
						suggestion_data[value_array[i].name] = value_array[i].value;
					}
			}
            
            this.suggestionModel = this.getModel('suggestion');
            
            // submit a request to 'suggestion' API
            this.suggestionModel.submitSuggestion({
            	data : suggestion_data,
                success : this._submitSuccess,
                error : this._submitError,
                context : this
            });
        },

        /**
         * Whether the suggestion submission is successful or not, show "thank you" message to the user.
         */
        _submitSuccess : function() {
           
            this.$el.html(this.compileTemplate('suggest_submitted'));
        },

        /**
         * Whether the suggestion submission is successful or not, show "thank you" message to the user.
         */
        _submitError : function() {

           this._submitSuccess(); 
        }
    });

    return FormSuggestionComponent; 
});
