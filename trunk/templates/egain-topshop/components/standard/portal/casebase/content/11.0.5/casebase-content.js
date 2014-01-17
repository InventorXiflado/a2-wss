  define(['core/component','core/helpers'],

  function (CoreComponent, helpers) {

    var CasebaseContentComponent = CoreComponent.extend({

        name : 'casebase-content',

        events : {

            'click .change-ans' : 'onEditQuestionClick',
            'change input[type=radio]' : 'onNonTextInputChange',
            'click select' : 'onNonTextInputChange',
            'change input[type=checkbox].question' : 'onCheckboxChange',
            'change input[type=checkbox].active' : 'onToggleActiveCluster',
            'blur input[type=text], textarea' : 'onTextEntered',
            'click .done-button' : 'onDoneButton',
            'click .add-info-expand' : 'expandAdditionalInfo',
            'click .add-info-collapse' : 'collapseAdditionalInfo',
			'click .accept-solution' : 'onAcceptSolution',
			'click .reject-solution' : 'onRejectSolution',
			'click .get-details' : 'getCaseDetails',
			'click .hide-details' : 'hideCaseDetails',
			'click .replace-button' : 'onReplace'
        },

        /**
         * Obtains casebase model and casebase ID,
         * processes url query string parameters if any,
         * and starts a GH session.
         */
        prepare : function() {

            // check if Guided Help is enabled
            var isEnabledGuidedHelp = this.app.getPortalSetting("enableGuidedHelp");
			if(isEnabledGuidedHelp)
			{
                this.id = this.getProperty('casebaseId');
                this.casebaseModel = this.getModel('casebase');

                this._answeredQuestions = [];
                this._answeredQuestionsCount = 0;

                // store all the un-submitted answers
                this._unsubmittedAnswers = {};

                // there will be a query string if we landed here from GHS article
                this.queryObject = this.page.getQueryString();

                if(this.queryObject && !$.isEmptyObject(this.queryObject)) {

                    this.queryObject.casebaseId = this.id;

                    // convert FI to filterId
                    if(this.queryObject.FI) {
                        this.queryObject.filterId = this.queryObject.FI;
                        delete this.queryObject.FI;
                    }

                    // convert PR to profileId
                    if(this.queryObject.PR) {
                        this.queryObject.profileId = this.queryObject.PR;
                        delete this.queryObject.PR;
                    }

                    // start a GH session first
                    this.casebaseModel.start({

                        data : this.queryObject,
                        success : this._onGHSessionStart,
                        context : this
                    });
                }
                else { // there is no query string, it's a regular GH session
                    this.casebaseModel.start({

                        data : {casebaseId : this.id},
                        success : this._onGHSessionStart,
                        context : this
                    });
                }
			}
			else
            {
                this._hideLoadingImage();
                this.declareError(this.ERROR_CODES.CONFIG_ERROR, 'ERROR_GUIDED_HELP_NOT_ENABLED');
            }
        },

        /**
         * Provides next step processing after GH session had been started.
         */
        _onGHSessionStart : function(data) {

        	// if we are coming from GHS article and there are some pre-answered questions,
        	// we need to submit those first
        	if(this.queryObject && !$.isEmptyObject(this.queryObject)) {

        		// to continue existing GH session, all below attributes should be removed
        		delete this.queryObject.casebaseId;
        		delete this.queryObject.filterId;
        		delete this.queryObject.profileId;

                /* if 'queryObject' is now empty, it means there were no pre-answered
                 * questions. Just display the data returned by 'GH start' API.
                 */
                if(!$.isEmptyObject(this.queryObject)) {
                    this.casebaseModel.submitAnswers({
                        data : this.queryObject,
                        'success' : this._onAnswerQuestionSuccess,
                        'context' : this
                    });
                }
                else
                    this._onCasebaseDisplay(data);
        	}
        	else { // regular session => display data
        		this._onCasebaseDisplay(data);
        	}
        },

        /** Displays the casebase according to provided data. */
        _onCasebaseDisplay : function(data) {

        	var unansweredQuestions = data.unansweredQuestion;
        	this._processQuestionsObject(unansweredQuestions, false);

        	var answeredQuestions = data.answeredQuestion;
        	this._processQuestionsObject(answeredQuestions, true);

        	this.filterId = data.casebase.filterId;

        	var solutions = [];
        	var showActionResults = false;
        	var isEmptySolution = false;

        	/*guidedHelpShowInSearchResults is 0 for articles*/
        	if(this.app.PORTAL_SETTINGS.guidedHelpShowInSearchResults == 0) {
				if(data.actionSearch.length > 0)
				{
					/*Creating a clone so that removing non article solutions has no effect on response data*/
					solutions = data.actionSearch.slice(0);
				}
				showActionResults = true;
        		this._discardNonArticleSolutions(solutions);
        	}
			/*guidedHelpShowInSearchResults is 1 for cases*/
        	else if (this.app.PORTAL_SETTINGS.guidedHelpShowInSearchResults == 1) {
				if(data.caseSearch.length > 0)
					solutions = data.caseSearch;
				showActionResults = false;
			}

        	if (solutions.length == 0) {
        		isEmptySolution = true;
        		if (unansweredQuestions.length > 0) {
        			solutions = this.app.language.compileString("GH_SOLUTIONS_PROMPT");
        		}
        		else {
        			solutions = this.app.language.compileString("GH_NO_SOLUTIONS");
        		}
        	}

			var diagnostics = [];
			/*Initializing the showDiagnostics flags to false.
			These will be changed according to the setting for the portal*/
        	var showDiagnostics = {
				showDiagnostics : false,
				showClusterDiagnostics : false,
				showControlDiagnostics : false
			};

			if(this.app.PORTAL_SETTINGS.guidedHelpEnableClusterScopeDiagnostics == 1)
			{
				showDiagnostics.showClusterDiagnostics = true;
				showDiagnostics.showDiagnostics = true;
				diagnostics.clusterDiagnostics = data.clusterDiagnostics.cluster;
				showDiagnostics.clusterCount = data.clusterDiagnostics.cluster.length;
			}

			if(this.app.PORTAL_SETTINGS.guidedHelpEnableControlActionDiagnostics == 1)
			{
				showDiagnostics.showControlDiagnostics = true;
				showDiagnostics.showDiagnostics = true;
				diagnostics.controlDiagnostics = data.actionSearch.slice(0);
				this._extractControlDiagnostics(diagnostics.controlDiagnostics);
				showDiagnostics.controlCount = diagnostics.controlDiagnostics.length;
			}

            this.render({

                unansweredQuestions : unansweredQuestions,
                answeredQuestions : answeredQuestions,
                solutions : solutions,
                isEmptySolution : isEmptySolution,
                showActionResults : showActionResults,
                casebaseName : data.casebase.title,
                showDiagnostics : showDiagnostics,
                diagnostics : diagnostics
            });
            if(showDiagnostics.controlCount == 0)
            	this.$('ul.control-table').toggle(false);
            else
            	this.$('ul.control-table').toggle(true);
            if(showDiagnostics.clusterCount == 0)
            	this.$('ul.cluster-table').toggle(false);
            else
            	this.$('ul.cluster-table').toggle(true);
        },

		/*Removes all non-article objects in the array passed as parameter*/
        _discardNonArticleSolutions : function(solutions) {

        	for (var i = 0; i < solutions.length; i++) {
        		if(!solutions[i].articleId) {
        			solutions.splice(i, 1);
        			i--; // compensating for array shortening
        		}
        	}
        },

		/*Removes all non-article objects in the array passed as parameter*/
        _extractControlDiagnostics : function(actionSearch) {
			for (var i = 0; i < actionSearch.length; i++) {
        		if(actionSearch[i].articleId) {
        			actionSearch.splice(i, 1);
        			i--; // compensating for array shortening
        		}
        	}
		},

		/*This function return all the questions that have been answered by the user in the format accepted by the server.*/
		_getAnsweredQuestions : function() {
			var answeredQuestions = this._unsubmittedAnswers;
			var questionData = {};

            // create answer strings in the format acceptable by API
            for (var i in answeredQuestions) {
            	var questionType = answeredQuestions[i].questionType;
            	var questionFormat = answeredQuestions[i].questionFormat;
            	var questionId = answeredQuestions[i].questionId;
            	var answerValue = answeredQuestions[i].answerValue;

            	questionData['Q' + questionType +
                 '-' + questionFormat +
                 '-' + questionId] = answerValue;
            }
            return questionData;
		},

        _processQuestionsObject : function(questionsObject, isAnswered) {

        	if (!questionsObject)
        		return;

        	for (var i = 0; i < questionsObject.length; i++) {
        		if (isAnswered) {
        			questionsObject[i].collapsed = "collapsed";
        			questionsObject[i].answered = "selfservice-gh-answered";

        			var qImageSrc = this.getProperty('answeredQuestionImg');
        			questionsObject[i].answeredQuestion = true;
        		}
        		else {
        			qImageSrc = this.getProperty('questionImg');
        		}
        		questionsObject[i].qImageSrc = qImageSrc;

        		var previousAnswers = questionsObject[i].previousAnswer;

        		var questionFormat = questionsObject[i].format;
        		if (questionFormat == 2) {  // drop down
        			questionsObject[i].isDropDown = true;
        		}
        		else if (questionFormat == 4) {  // multi-select drop down
        			questionsObject[i].isDropDown = true;
        			questionsObject[i].multiple = "multiple";
        		}
        		else if (questionFormat == 5 || questionFormat == 6 || questionFormat == 7 || questionFormat == 8) {
        			questionsObject[i].text = true;
        			if (previousAnswers && previousAnswers.length > 0) {
        				questionsObject[i].answeredText = previousAnswers[0].text;
        			}
        		}

        		// check if this question has "additional info" present
        		if (this.app.getPortalSetting("enableGuidedHelpShowAdditionalDetailsForSearchResults") &&
        		         questionsObject[i].annotation) {
        			var annotation = questionsObject[i].annotation;
        			for (var index = 0; index < annotation.length; index++) {
        				if (annotation[index].annotationType == "ADDITIONAL_INFORMATION"
        					&& annotation[index].content) {

        					questionsObject[i].additionalInfo = annotation[index].content;
        					break;
        				}
        			}
        		}

        		var answers = questionsObject[i].validAnswer;
        		if (questionFormat > 4 || !answers || answers.length < 1)
        			continue;

        		var prevAnswerTextArray = [];
        		for (var j = 0; j < answers.length; j++) {
        			var answer = answers[j];
        			answer.questionId = questionsObject[i].id;
        			answer.questionFormat = questionFormat;

        			if (previousAnswers && previousAnswers.length > 0) {
	        			for (var k = 0; k < previousAnswers.length; k++) {
	        				if (answer.id == previousAnswers[k].id) {
	        					if (questionFormat == 2 || questionFormat == 4) {
	        						answer.isSelected = "selected";
	        					}
	        					else if (questionFormat == 1 || questionFormat == 3) {
	        						answer.isSelected = "checked";
	        					}
	        					prevAnswerTextArray.push(previousAnswers[k].text);
	        				}
	        			}
        			}
        		}

        		if (prevAnswerTextArray && questionFormat != 5 && questionFormat != 6) {
        			questionsObject[i].answeredText = prevAnswerTextArray.join(", ");
        		}
        	}
        },

		ellipsify : function(objArr, variableName)
		{
       		for (var i = 0; i < objArr.length; i++) {
        		if(objArr[i][variableName].length > 50) {
        		objArr[i][variableName] = objArr[i][variableName].substring(0,50) + '...';
        		}
        	}

		},

        /*This function will be executed when edit option is clicked for a collapsed question.*/
        onEditQuestionClick : function(e) {

        	//Remove the collapsed class of the clicked question, which will show its answers list.
        	$(e.currentTarget).closest('li').removeClass('collapsed')

        	$(e.currentTarget).closest('li').find('.previous-answer').hide();
        	$(e.currentTarget).toggle(false);
        },

        onNonTextInputChange : function(e) {

        	var $inputTarget = $(e.currentTarget);
        	var answerIds = $inputTarget.val();

        	this._addToUnsubmittedAnswers($inputTarget, answerIds);
        },

        onCheckboxChange : function(e) {

        	var $inputTarget = $(e.target);
        	var questionId = $inputTarget.attr('class');

        	var checkboxAnswers = [];

        	$('input.' + questionId + '[type=checkbox]').each(function() {

        		var $checkbox = $(this);
        		if($checkbox.is(':checked')) {
        			checkboxAnswers.push($checkbox.val());
        		}
			});

			this._addToUnsubmittedAnswers($inputTarget, checkboxAnswers);
        },

        onTextEntered : function(e) {

        	var $inputTarget = $(e.target);
        	var text = $inputTarget.val();
        	if (text == '')
        		return;

        	var $question = $inputTarget.parents('.question');
        	var questionType = $question.attr('data-type');

        	if (questionType == 3) {

        		var answerMinValue = $question.attr('data-min-value');
        		var answerMaxValue = $question.attr('data-max-value');
        		var answerMinInclusive = $question.attr('data-min-inclusive');
        		var answerMaxInclusive = $question.attr('data-max-inclusive');

        		var inclusiveStr = this.app.language.compileString("INCLUSIVE");
        		var exclusiveStr = this.app.language.compileString("EXCLUSIVE");

        		var minInclusiveStr = answerMinInclusive ? inclusiveStr : exclusiveStr;
        		var maxInclusiveStr = answerMaxInclusive ? inclusiveStr : exclusiveStr;

        		var argObject = {
        			'answerMinValue' : answerMinValue,
	                'minInclusiveStr' : minInclusiveStr,
	                'answerMaxValue' : answerMaxValue,
	                'maxInclusiveStr' : maxInclusiveStr
        		};

        		if (!this._isStringNumber(text)) {
        			var errorMessage = this.app.language.compileString("GH_NUMERIC_VALIDATION", argObject);
        			alert(errorMessage);
        			$inputTarget.val('');
        			return;
        		}

        		var actualNumericValue = parseFloat(text);

        		if ((answerMinInclusive && actualNumericValue < answerMinValue) ||
        		    (!answerMinInclusive && actualNumericValue <= answerMinValue)) {

        			var errorMessage = this.app.language.compileString("GH_NUMERIC_VALIDATION", argObject);
        			alert(errorMessage);
        			$inputTarget.val('');
        			return;
        		}

        		if ((answerMaxInclusive && actualNumericValue > answerMaxValue) ||
        		    (!answerMaxInclusive && actualNumericValue >= answerMaxValue)) {

        			var errorMessage = this.app.language.compileString("GH_NUMERIC_VALIDATION", argObject);
        			alert(errorMessage);
        			$inputTarget.val('');
        			return;
        		}

        		this._addToUnsubmittedAnswers($inputTarget, actualNumericValue);
        	}
        	else {
        		this._addToUnsubmittedAnswers($inputTarget, text);
        	}
        },

		onAcceptSolution : function(e) {

			this.showLoadingImage('questions');
			var articleId = e.currentTarget.id.substring(e.currentTarget.id.indexOf("accept") + "accept".length);
			this.casebaseModel.acceptRejectSolution({
				requestName : 'accept',
				id : articleId,
				actionName : this.$('#' + articleId + 'Name').text().trim(),
				casebaseId : this.id,
				success: this._onAcceptSuccess,
                error: this._onAcceptRejectError,
				profileId : this.filterId,
				context: this
			});
		},

		onRejectSolution : function(e) {

			this.showLoadingImage('questions');
			var articleId = e.currentTarget.id.substring(e.currentTarget.id.indexOf("reject") + "reject".length);
			this.casebaseModel.acceptRejectSolution({
				requestName : 'reject',
				id : articleId,
				actionName : $('#' + articleId + 'Name').text().trim(),
				casebaseId : this.id,
				success: this._onRejectSuccess,
                error: this._onAcceptRejectError,
                profileId : this.filterId,
                context: this
			});
		},

        _isStringNumber : function(numStr) {
        	return numStr == parseFloat(numStr);
        },

		/*This function is called when the active state is changed for a cluster in cluster diagnostics*/
        onToggleActiveCluster : function(e) {
        	var questionData = this._getAnsweredQuestions();
			questionData['CLUSTERID'] = e.currentTarget.value;

			if($(e.currentTarget).is(':checked')) {
				questionData['CLCMD'] = 'add';
			}
			else {
				questionData['CLCMD'] = 'remove';
			}
			this.casebaseModel.submitAnswers({

					'data' : questionData,
					'success' : this._onAnswerQuestionSuccess,
					'context' : this
            });
		},

		/*This function is called when all clusters are replaced by a single cluster in cluster diagnostics*/
		onReplace : function(e) {
        	var questionData = this._getAnsweredQuestions();
			questionData['CLUSTERID'] = e.currentTarget.id;
			questionData['CLCMD'] = 'exclusive';

			this.casebaseModel.submitAnswers({

				'data' : questionData,
				'success' : this._onAnswerQuestionSuccess,
				'context' : this
			});
		},

        _addToUnsubmittedAnswers : function($inputTarget, answerValue) {

        	var $question = $inputTarget.parents('.question');
        	var questionId = $question.attr('data-id');
        	var questionType = $question.attr('data-type');
            var questionFormat = $question.attr('data-format');

            this._unsubmittedAnswers[questionId] = {

	            'questionId' : questionId,
	            'questionType' : questionType,
	            'questionFormat' : questionFormat,
	            'answerValue' : answerValue
            };
        },

        /** Submits the answer(s) when a user clicks on "Done" button */
        onDoneButton : function(e) {

        	var answeredQuestions = this._unsubmittedAnswers;

        	if ($.isEmptyObject(answeredQuestions))
        	   return;
			this.showLoadingImage('questions');

        	var questionData = this._getAnsweredQuestions()

        	this.casebaseModel.submitAnswers({

                data : questionData,
                'success' : this._onAnswerQuestionSuccess,
                'context' : this
            });
        },

        /**
         * Expands additional information section when a user clicks on "More Info" icon.
         */
        expandAdditionalInfo : function(e) {

        	var targets = this._getAddInfoEventTargets(e);

        	// switch icon
        	targets.icon.removeClass('icon-caret-down');
        	targets.icon.addClass('icon-caret-up');
        	// change clickable text
        	targets.iconText.html(this.app.language.compileString("LESS_INFO"));

        	// expand the content
        	targets.addInfo.removeClass('hide-add-info');

        	// switch the event class
        	targets.inputTarget.removeClass('add-info-expand');
        	targets.inputTarget.addClass('add-info-collapse');
        },

        /**
         * Collapses additional information section when a user clicks on "Less Info" icon.
         */
        collapseAdditionalInfo : function(e) {

        	var targets = this._getAddInfoEventTargets(e);

        	// switch icon
        	targets.icon.removeClass('icon-caret-up');
        	targets.icon.addClass('icon-caret-down');
        	// change clickable text
        	targets.iconText.html(this.app.language.compileString("MORE_INFO"));

        	// collapse the content
        	targets.addInfo.addClass('hide-add-info');

        	// switch the event class
        	targets.inputTarget.removeClass('add-info-collapse');
        	targets.inputTarget.addClass('add-info-expand');
        },

		/*This function gets the details for a case shown in solutions list.*/
        getCaseDetails : function(e) {
			var caseId = e.currentTarget.id;
			this.showLoadingImage(caseId);
			this.casebaseModel.getCaseDetails({
				caseId : caseId,
				releaseId : this.id,
				context: this,
				success: this._onGetCaseDetailsSuccess,
                error: this._onGetCaseDetailsFailure
			});
		},

		hideCaseDetails : function(e) {
			var caseId = e.currentTarget.id;
			this.$('i#'+caseId).removeClass('icon-chevron-up').addClass('icon-chevron-down');
			this.$('i#'+caseId).removeClass('hide-details').addClass('get-details');
			this.$('#details'+caseId).remove();
		},

        /**
         * Gets actionable targets for expanding/collapsing Additional Info section
         */
        _getAddInfoEventTargets : function(e) {

        	var $inputTarget = $(e.currentTarget);
        	var $icon = $inputTarget.find('.egce-icon');
        	var $iconText = $inputTarget.find('.egce-icon-text');
        	var $addInfo = $inputTarget.parent().find('.add-info-content');

        	return {
        		inputTarget : $inputTarget,
        		icon : $icon,
        		iconText : $iconText,
        		addInfo : $addInfo
        	}
        },

        _onAnswerQuestionSuccess : function(data) {

            this._unsubmittedAnswers = {};
            this._onCasebaseDisplay(data);
			this.hideLoadingImage();
        },

		_onRejectSuccess : function(data) {
			this.hideLoadingImage();
			this.$('.egce-box-content').toggle(false);
			this.$('.diagnostics').toggle(false);
			this.$('.messages-container').text(this.app.language.compileString("REJECT_MESSAGE")).toggle(true);
		},

		_onAcceptSuccess : function(data) {
			this.hideLoadingImage();
			this.$('.egce-box-content').toggle(false);
			this.$('.diagnostics').toggle(false);
			this.$('.messages-container').text(this.app.language.compileString("ACCEPT_MESSAGE")).toggle(true);
		},

		_onGetCaseDetailsSuccess : function(data) {
			this.hideLoadingImage();
			var caseDetails = {
				caseId : data['case'][0].id
			};
			this._discardNonArticleSolutions(data['case'][0].action);
			this.ellipsify(data['case'][0].action, 'shortName');
			$(this.compileTemplate('solution-case-details', data['case'][0])).insertAfter($('li#' + data['case'][0].id));
			this.$('i#' + data['case'][0].id).removeClass('icon-chevron-down').addClass('icon-chevron-up');
			this.$('i#' + data['case'][0].id).removeClass('get-details').addClass('hide-details');
		},

		_onGetCaseDetailsFailure : function(caseId) {
			this.hideLoadingImage();
			this.$('.error-container').text(this.app.language.compileString("ERROR_GET_CASE_DETAILS_MESSAGE")).toggle(true);
			this.$('.error-container').insertAfter($('li#' + caseId));
		},

		_onAcceptRejectError : function(data) {
			this.hideLoadingImage();
			this.$('.egce-box-content').toggle(false);
			this.$('.diagnostics').toggle(false);
			this.$('.error-container').text(this.app.language.compileString("ERROR_REQUEST")).toggle(true);
		},

        buildUrl : function(article) {

			return this.app.getPageUrl(this.getProperty('articlePage') || 'article', article.articleId,
			       this.slugify(article.shortName));
        },
	/*
	* Displays the spinner to notify the user to wait while processing completes.
	*/
        showLoadingImage : function (targetDivId) {

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

	/*
	* Hides the waiting spinner once processing is done.
	*/
        hideLoadingImage : function () {

            this.spinner.stop();
		}
    });

    return CasebaseContentComponent;
});
