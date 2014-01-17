 define(['underscore',
         'core/component', 
         './extra/js/autocomplete.js'], 
 
 function(_, CoreComponent, Autocomplete) {

    var SearchBarComponent = CoreComponent.extend({

        name : 'search-bar',

        events : {
            
            "click" : "_stopPropagation",
            "focus input[type=text]" : "focusInput",
            "submit form" : "onFormSubmit",
            "click .js-icon-submit" : "onIconSubmit",
            "mouseenter input[type=text]" : "mouseenterInput",
            "keyup input[type=text]" : "typingInput"
        },

        prepare : function() {
            
            this.search = this.getModel('search');
            this.articleModel = this.getModel('article');

            var query = this.getProperty('query', ''); 
            
            this.render({
            
                query : query
            });

            this.autocomplete = new Autocomplete({parent:this});
            this.autocomplete.on('select', this._onAutocompleteSelect, this);

            $('html').on('click', _.bind(this.autocomplete.hide, 
                                         this.autocomplete));
            
            //To prevent searching with the placeholder text.
            this._input_locked = true;
        },

        focusInput : function() {

            this.$('input[type=text]').val('');
        },

        onFormSubmit : function(e) {
                
            e.preventDefault();
            
            var $input = this.$("input[type=text]"),
                value = $input.val();
            
            if(!value) {
                
                $input.focus();
            }
            
            this.navigateToSearchPage(value);
        },

        submitSearch : function() {

            var $input = this.$("input[type=text]"),
                value = $input.val();
            
            if(!value) {
                
                $input.focus();
            }
            
            this.navigateToSearchPage(value);
        },

        mouseenterInput : function() {},

        typingInput : function(e) {
            
            //Skip handler if it's an arrow key or enter key
            //so it doesn't mistakenly interpret it as 
            //input box value change.
            if(_.include([37, 38, 39, 40, 13], e.keyCode))
                return;

            var value = $(e.target).val();

            this.send('egain11.product.search.type', value);

            this.search.getSuggestionText({

                success : this._onAutocompleteArrive,
                context : this,
                limit : 5,
                query : value
            });

            this._input_locked = false;
        },

        _showAutocomplete : function(value) {

            this.search.getSuggestionText({
                
                query : value,
                success : this._onAutocompleteArrive
            });
        },

        _onAutocompleteArrive : function(suggestions) {

            console.log("SUGGESTIONS", suggestions);
            
            this.autocomplete.showSuggestions(suggestions);
        },

        _onAutocompleteSelect : function(value) {
            
            this.navigateToSearchPage(value);
        },

        _stopPropagation : function(e) {

            e.stopPropagation();
        },

        navigateToSearchPage : function(query) {

            if(query && !this._input_locked) {
            	
            	if(query.indexOf('%') != -1)
            		query = query.replace('%', '');

                this.navigateToPage(this.getProperty('search_page'), $.trim(query));
            }
        },

        onIconSubmit : function() {
            
            this.$('input[type="submit"]').trigger('click');
        }
    });

    return SearchBarComponent; 
});
