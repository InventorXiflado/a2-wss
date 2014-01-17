define(['underscore',
        'core/helpers',
        'core/helper_component',
        'core/libs/js/shortcut',
        'text!./../html/autocomplete.html'],

function(_, Helpers, HelperComponent, shortcut, tpl_autocomplete) {

    var Autocomplete = HelperComponent.extend({

        className : 'autocomplete',

        events : {

            'click' : '_stopPropagation',
            'click li' : 'onSuggestionClick',
            'mouseover li' : 'onEntryMouseover',
            'mouseleave li' : 'onEntryMouseleave'
        },

        initialize : function() {

            var _this = this;

            this.parent = this.options.parent;
            this.parent.$el.append(this.el);

            this.articleModel = this.parent.articleModel;
        },

        refresh : function() {


        },

        show : function() {

            console.log('show');
            //debugger;
            this.$el.show();
        },

        hide : function() {

            this._deactivateKeyboardHooks();

            this.$el.hide();
        },

        _stopPropagation : function(e) {

            e.stopPropagation();
        },

        showSuggestions : function(suggestions, announcements) {



            this.show();
            this._activateKeyboardHooks();

            this._highlight_index = -1;

            //Group the suggestions
			this._suggestions = suggestions;

            var html = this.compile(tpl_autocomplete, {

                suggestions : this._processSuggestions(suggestions, announcements)
            });

            this.$el.html(html);
        },

        /*
            Group the suggestions into these groups:

            1. General
            2. Articles
            3. Topics
            4. Announcements
        */
        _processSuggestions : function(suggestions, announcements) {

            var suggestionsMap = {};

            _.each(suggestions, function(suggestion) {

                if(!suggestionsMap[suggestion.type]) {

                    suggestionsMap[suggestion.type] = [];
                }
            	if(suggestion.entity_id == undefined || jQuery.inArray(suggestion.entity_id, announcements)==-1){
					suggestionsMap[suggestion.type].push(suggestion);
				}
            }, this);

            return suggestionsMap;
        },

        onSuggestionClick : function(e) {

            var $li = $(e.target);

            this._doActionBasedOnLiType($li);

            this.hide();
        },

        onEntryMouseover : function(e) {

            $(e.target).addClass('active');
        },

        onEntryMouseleave : function(e) {

            console.log("MOUSELEAVE!");
            $(e.target).removeClass('active');
        },

        _activateKeyboardHooks : function() {

            var _this = this;

            if(this._hooks_activated) {

                return;
            }

            shortcut.add('Down', _.bind(this._onDownArrow, this));
            shortcut.add('Up', _.bind(this._onUpArrow, this));
            shortcut.add('Enter', _.bind(this._onEnterKey, this));

            this._hooks_activated = true;
        },

        _onDownArrow : function(e) {

            if(!this._suggestions.length)
                return;

            //Remove the active class in the li.
            this.$('li').removeClass('active');

            if(this._highlight_index == this._suggestions.length - 1)
                this._highlight_index = -1;
            else
                this._highlight_index++;

            this._updateHighlight();
        },

        _onUpArrow : function(e) {

            if(!this._suggestions.length) return;

            //Remove the active class in the li.
            this.$('li').removeClass('active');

            if(this._highlight_index == -1)
                this._highlight_index = this._suggestions.length - 1;
            else
                this._highlight_index--;

            this._updateHighlight();
        },

        _updateHighlight : function() {

            var $li = $(this.$('li')[this._highlight_index]);
            $li.addClass('active');
        },

        _getHighlightedLi : function() {

            return $(this.$('li')[this._highlight_index]);
        },

        _onEnterKey : function(e) {

            console.log('enter key!', e);

            this.hide();

            if(this._highlight_index === -1) {

                //If the current highlight is on the search bar itself,
                //then just forward them to actual search page based
                //on the current query that has been typed.
                this.parent.submitSearch();

            } else {

                //If the current highlight is on one of the autocomplete's
                //entry, then forward them to search page based on the
                //current query that is highlighted
                var $li = this._getHighlightedLi();

                this._doActionBasedOnLiType($li);
            }
        },

        _doActionBasedOnLiType : function($li) {

            var value = $.trim($li.text());
            var type = $li.attr('data-type');
            var entityId = $li.attr('data-entity-id');

            switch(type) {

                case 'article':
                case 'guided_help': // guided help session article; navigate to article content page and it'll take care of the rest

                    this.parent.navigateToPage(this.parent.getProperty('article_page'),
                                                entityId,
                                                Helpers.prettify(value));

                break;

                case 'topic':

                    this.parent.navigateToPage(this.parent.getProperty('topic_page'),
                                               entityId,
                                               Helpers.prettify(value));

                break;

                default:
                    this.trigger('select', value)
            }
        },

        _deactivateKeyboardHooks : function() {

            shortcut.remove('Down');
            shortcut.remove('Up');
            shortcut.remove('Enter');

            this._hooks_activated = false;
        }
    });

    return Autocomplete;
});
