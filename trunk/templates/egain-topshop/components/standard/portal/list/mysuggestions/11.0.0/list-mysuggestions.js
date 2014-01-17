  define(['core/component','core/helpers'],

  function (CoreComponent, helpers) {

      var FormSuggestionComponent = CoreComponent.extend({

          name: 'list-mysuggestions',

          events: {

              "click #suggested": "fetchSubmittedSuggestions",
              "click #pending": "fetchPendingSuggestions",
              "click #approved": "fetchApprovedSuggestions",
              "click #rejected": "fetchRejectedSuggestions",
              "click #viewdetails": "getSuggestionDetails",
              "click #deletesuggestion": "deleteSuggestion",
              "click .sortoption": "getSortSuggestions",
              "click .js-load-more": "onLoadMoreClick"
          },

          prepare: function () {

              this.suggestionModel = this.getModel('suggestion');
              this.limit = this.getProperty('limit', 5);
              this.skip = this.getProperty('skipped_suggestion_count', 0);
              this.fetchSubmittedSuggestions();
              this.sortStatus = {};

          },

          /*This function changes the active drop down state to the target state*/

          changeDropDownState: function (targetState) {

              this.limit = this.getProperty('limit', 5);
              this.skip = this.getProperty('skipped_suggestion_count', 0);
              this.$('#selectedtypevalue').html(this.app.language.compileString(targetState.toUpperCase()));
              this.$('.egce-dropdown li').removeClass('egce-selected-option');
              this.$('#' + targetState).addClass('egce-selected-option');
          },

          setSortOptionState: function (selectedOptionId) {

              this.$('.sortoption').addClass('sortoptionnotselected');
              this.$('#' + selectedOptionId).removeClass('sortoptionnotselected');
              this.$('#' + selectedOptionId).addClass('sortoptionselected');
              if (typeof this.sortStatus.orderAscending == "undefined") this.sortStatus.orderAscending = true;
              else if (this.sortStatus.sortCriteria == selectedOptionId && this.sortStatus.orderAscending) this.sortStatus.orderAscending = false;
              else this.sortStatus.orderAscending = true;
              this.sortStatus.sortCriteria = selectedOptionId;

          },

          fetchSubmittedSuggestions: function (e) {

              this.activeState = 'suggested';
              this.getSuggestions();
          },

          fetchPendingSuggestions: function (e) {

              this.activeState = 'pending';
              this.getSuggestions();

          },

          fetchRejectedSuggestions: function (e) {

              this.activeState = 'rejected';
              this.getSuggestions();
          },

          fetchApprovedSuggestions: function (e) {

              this.activeState = 'approved';
              this.getSuggestions();
          },

          getSuggestions: function () {

              this.changeDropDownState(this.activeState);
              this.$('#suggestionsListDiv').addClass('egce-minheight');
              this.$('#suggestionsList').toggle(false);
              this.showLoadingImage('suggestionsListDiv');
              this.suggestionModel.getSuggestions({

                  target: this.activeState,
                  success: this._onGetSuggestionsSuccess,
                  skip: this.skip,
                  limit: this.limit,
                  error: this._onGetSuggestionsError,
                  context: this
              });

          },

          onLoadMoreClick: function () {

              this.skip += this.limit;

              this.showLoadingImage('suggestionsListDiv');
              this.suggestionModel.getSuggestions({

                  target: this.activeState,
                  success: this._onGetMoreSuggestionsSuccess,
                  skip: this.skip,
                  limit: this.limit,
                  error: this._onGetMoreSuggestionsError,
                  context: this
              });
          },

          getSuggestionDetails: function (e) {

              if (e.target.id != 'deletesuggestion') {
                  var _this = this;
                  var component = this.app.page.createComponent({

                      name: 'standard.portal.content.suggestion',
                      models: {
                          suggestion: {
                              id: 12
                          }
                      },
                      properties: {
                          suggestionId: e.currentTarget.parentElement.id,
                          suggestiontype: this.activeState
                      }

                  }, function (component) {

                      //Tell the current page to show modal containing the suggestion details component that we just downloaded.
                      _this.app.page.showModal({

                          component: component
                      });
                  });
              }
          },

          deleteSuggestion: function (e) {

              this.showLoadingImage(e.currentTarget.parentElement.id);
              this.suggestionModel.deleteSuggestion({

                  suggestionId: e.currentTarget.parentElement.id,
                  success: this._onDeleteSuggestionSuccess,
                  error: this._onDeleteSuggestionError,
                  context: this
              });
          },

          _onGetSuggestionsSuccess: function (data) {

              this.parseDate(data.suggestion, 'lastModifiedDate');
              this.showEllipsis(data.suggestion);
              this.hideLoadingImage();
              this.$('#suggestionsListDiv').removeClass('egce-minheight');

              this.render({

                  results: data,
                  show_load_more: this.shouldShowLoadMore(data.pagingInfo.maxRange)
              });
              this.changeDropDownState(this.activeState);
              this.$('#errormsg').toggle(false);
              if (this.activeState == 'approved') this.$('.delete-icon').toggle(false);

          },

          _onGetSuggestionsError: function (data) {

              this.hideLoadingImage();
              this.$('#suggestionsListDiv').removeClass('egce-minheight');
              this.$('#errormsg').text(this.app.language.compileString("ERROR_REQUEST"));
              this.$('#errormsg').toggle(true);
              this.$('#errormsg').insertAfter('#pageoptions');
          },

          _onGetMoreSuggestionsSuccess: function (data) {

              this.hideLoadingImage('suggestionsListDiv');
              if (!this.shouldShowLoadMore(data.pagingInfo.maxRange)) {

                  this.$('.js-load-more').hide();
              }
              this.parseDate(data.suggestion, 'lastModifiedDate');

              _.each(data.suggestion, function (suggestion) {

                  this.$('#suggestionsList').append(this.compileTemplate('suggestion-row', suggestion));

              }, this);
          },

          _onGetMoreSuggestionsError: function (data) {


          },

          _onDeleteSuggestionSuccess: function (data) {

              //Remove the deleted suggestion from the list.
              this.$('#' + data.deletedSuggestionId).remove();
              if (this.$("#suggestionsList li").size() == 0) {

                  this.$('#' + this.activeState).trigger('click');
              }

          },

          _onDeleteSuggestionError: function (data) {

              this.hideLoadingImage();
              this.$('#errormsg').text(this.app.language.compileString("ERROR_REQUEST"));
              this.$('#errormsg').toggle(true);
              this.$('li#' + data.suggestionId).append(this.$('#errormsg'));

          },

          showLoadingImage: function (targetDivId) {

              var opts = {

                  lines: 10, // The number of lines to draw
                  length: 3, // The length of each line
                  width: 2, // The line thickness
                  radius: 6, // The radius of the inner circle
                  rotate: 0, // The rotation offset
                  color: '#aaa', // #rgb or #rrggbb
                  speed: 1.3, // Rounds per second
                  trail: 60, // Afterglow percentage
                  shadow: false, // Whether to render a shadow
                  hwaccel: false, // Whether to use hardware acceleration
                  className: 'spinner' // The CSS class to assign to the spinner
              };

              var target = document.getElementById(targetDivId)
              this.spinner = new Spinner(opts).spin(target);

          },

          hideLoadingImage: function () {

              this.spinner.stop();

          },

          getSortSuggestions: function (e) {
              this.setSortOptionState(e.currentTarget.id);
	      /* To Do : Write the code to get suggestions from server in sorted order.*/
          },

          showEllipsis: function (suggestionArray) {
              for (var i = 0; i < suggestionArray.length; i++) {
				  if(suggestionArray[i].description && helpers.stripHtmlTags(suggestionArray[i].description).length > 220)
						suggestionArray[i].description = helpers.stripHtmlTags(suggestionArray[i].description).substring(0, 220) + '...';
				  if(helpers.stripHtmlTags(suggestionArray[i].name).length > 80)
					suggestionArray[i].name = helpers.stripHtmlTags(suggestionArray[i].name).substring(0, 80) + '...';
              }
          },

          parseDate: function (arrayToBeParsed, variableName) {
              for (var i = 0; i < arrayToBeParsed.length; i++) {
                  var date = arrayToBeParsed[i][variableName].substring(3, 6) + " " + arrayToBeParsed[i][variableName].substring(0, 3) + ", " + arrayToBeParsed[i][variableName].substring(7, 11);
                  arrayToBeParsed[i][variableName] = date;
              }

          },

          shouldShowLoadMore: function (maxCount) {

              return this.limit + this.skip < maxCount;
          }

      });

      return FormSuggestionComponent;
  });