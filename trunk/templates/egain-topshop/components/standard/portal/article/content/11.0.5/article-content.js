define(['core/component', 'core/helpers', 'raty'], function(BaseComponent, helpers, raty) {

    var ContentArticleComponent = BaseComponent.extend({

        name : "content-article",

        events : {

            "click .js-send-email" : "emailFriend",
            "click .attachment" : "getAttachment",
            "click .js-add-favorite" : "addAsFavorite",
            "click .js-print" : "onArticlePrintClick",
            "submit form.feedback-form" : "onFeedbackSubmit",
            "keyup textarea" : "onFeedbackTyping",
            "click .js-rate" : "onRateArticle",
			"click .add-to-reply" : "onAddToReply",
            "click .js-article-view-click" : "onArticleViewClick",
            "click .js-crmcase" : "addToCRMCase",
            "click #crmaddsolution" : "addToCRMCase",
			"click .js-article-view-external-click" : "onExternalUrlClick"
        },

        _solutionAdded:false,

        prepare : function(){

            this.articleModel = this.getModel('article');
            this.favorite = this.getModel('favorite');

            this.articleId = this.getProperty('article_id');

            // get saved "context" of the article - where it's being accessed from,
            // e.g. from GH, search results, popular articles etc.
            this.articleViewContext = this.getState('articleViewContext', null, true);

            //Retrieve the article.
            this.articleModel.retrieve({

                articleId :  this.articleId,

                //If successful, then run the articleRetrieved function.
                success : this._onArticleRetrieveSuccess,

                error : this._articleRetrieveError,

                //context
                context : this,

                highlightingQuery : this.page.getQueryString('fromQuery'),

                articleViewContext : this.articleViewContext

            }, this);

            // clear the article view context
            if (this.articleViewContext) {
                this.saveState('articleViewContext', '', true);
                this.articleViewContext = null;
            }

        },

        _onArticleRetrieveSuccess : function(article) {

            //Save the reference.
            this.article = article;

            if(article.articleType == 1) {
	            var qs = helpers.parseGHSarticleContent(helpers.decodeHtml(helpers.stripHtmlTags(article.content)));
	        }

	        //Check if the article is a GH article or not
	        if(qs && (qs.CB || qs.casebaseId)) {

	            // check if Guided Help is enabled
                var isEnabledGuidedHelp = this.app.getPortalSetting("enableGuidedHelp");
                if(!isEnabledGuidedHelp)
                {
                     this._hideLoadingImage();
                     // Displaying error if guided help is not enabled for portal
                     this.declareError(this.ERROR_CODES.CONFIG_ERROR, 'ERROR_GUIDED_HELP_NOT_ENABLED_ARTICLE');
                     return;
                }

                //Create a query string object without the CB to pass to the casebase page.
	            var casebaseInfoQs = _.clone(qs);
	            delete casebaseInfoQs['CB'];

	            console.log("CASEBASE INFO QS", casebaseInfoQs);

	            this.navigateToPage('casebase', qs.CB || qs.casebaseId, helpers.prettify(article.name), casebaseInfoQs);

	            return;
	        }
            var showRelatedCases = !!this.app.getPortalSetting('crmDomain');
            try {

                //If comes from the search page and is highlighted
                if(this.isHighlighted()) {

                    //Then look for highlighting text metadata
                    var contentCRs = article.textMetadata.highlightMetadata[0].characterRange;

                    article.content = helpers.highlightText(article.content, contentCRs);
                }

                this.render({

                    article : article,
                    favorited : this.favorite.isFavorite(article.id),
                    showAddToReply : !!this.app.manifest.getProjectVar('agentSolve'),
                    showRelatedCases : showRelatedCases,
                    showAddSolution: (this._getCRMCaseId()?true:false),
                    rateArticleQuestion: this.app.getPortalSetting("articleFeedbackQuestion")
                });
                
                // update document title with this article's name
                document.title = article.name;
                
                // update this page's meta description and keywords with article summary and keywords 
                helpers.createOrUpdateMetaTag('description', article.summary);
                helpers.createOrUpdateMetaTag('keywords', article.keywords);
            
            } catch(e) {

                if (console)
                    console.log("ERROR in article " + article.id, e.message);
            }

            // only pull Related Articles if they are enabled in portal configuration
            var isEnableRelatedArticles = this.app.getPortalSetting("enableRelatedArticlesSection");

        	if (isEnableRelatedArticles) {

        		this.articleModel.getRelatedArticles({

	                articleId : this.article.id,

	                success : function(data) {

	                    _.each(data.article, function(article) {

	                        this.$('.js-related-articles').append(this.compileTemplate('related-article-row', article));

	                    }, this);
						
	                    if(data.article.length == 0)
						{
							_.each(data.externalArticle, function(externalArticle) {

								this.$('.js-related-articles').append(this.compileTemplate('related-article-row-external', externalArticle));

							}, this);						
						}
						else
						{
							_.each(data.externalArticle, function(externalArticle) {

								if(externalArticle.relatedArticleOrder == 1) {
									this.$('ul.js-related-articles li:nth-child(1)').before(this.compileTemplate('related-article-row-external', externalArticle));
								}
								else {
									this.$('ul.js-related-articles li:nth-child(' + (externalArticle.relatedArticleOrder - 1) + ')').after(this.compileTemplate('related-article-row-external', externalArticle));
								}
								
							}, this);	
						}
						
                        if(data.article.length == 0 && data.externalArticle.length == 0)
                            $(".selfservice-related-articles").hide();
                        else
                            $(".selfservice-related-articles").show();
	                },

	                error : function() {

	                },

	                context : this
	            });

            } else {
            	$(".selfservice-related-articles").hide();
            }

            var crmDomain = this.app.getPortalSetting('crmDomain');

            if(showRelatedCases)
            {
                this.articleModel.getRelatedCases({

                    articleId : this.article.id,

                    success : function(extCases) {

                        _.each(extCases, function(extCase) {

                            var addedOnDate = new Date(extCase.addedOn);
                            var formattedAddedOn = (addedOnDate.getMonth()+1)+"/"+addedOnDate.getDay()+"/"+addedOnDate.getFullYear();
                            extCase.formattedAddedOn = formattedAddedOn;
                            extCase.crmDomain = crmDomain;
                            if(extCase.subject != "")
                                this.$('.js-related-cases').append(this.compileTemplate('related-case-row', extCase));

                            if(extCase.caseId.indexOf(this._getCRMCaseId()) == 0)
                            {
                            this._solutionAdded = true;
                            }

                        }, this);

                        if(extCases && extCases.length > 0)
                            this.$('.selfservice-related-cases').show();

                        var crmCaseId = this._getCRMCaseId();

                        $(".crmreturn").attr('href','https://'+crmDomain+'/'+crmCaseId);
                        $(".crmreturn").attr('target','_top');

                        if(crmCaseId == "")
                        {
                            $("#addsolution").hide();
                        }
                    else if(this._solutionAdded)
                        {
                            $(".js-crmcase").hide();
                        $("#crmaddsolution").removeClass("egce-hover");
                        $("#crmaddsolution").css("cursor","default");
                        $("#crmaddsolution").parent().removeClass("egce-hover");
                            $("#crmaddsolution").html(this.app.language.getString('CRM_SOLUTION_ADDED'));
                            $("#addsolution").show();
                        }
                        else
                            $("#addsolution").show();
                    },

                    error : function() {

                    },

                    context : this
                });
            }

            // only show Feedback Section if it's enabled in portal configuration
            var isEnableArticleFeedback = this.app.getPortalSetting("enableArticleFeedback");
        	if (!isEnableArticleFeedback) {

        		$(".js-rate-area").hide();
        	}
        	else {
                
                // check what type of rating scheme this portal uses
                var feedbackControlToUse = this.app.getPortalSetting("feedbackControlToUse");
                
                if (feedbackControlToUse == 5) { // 5 star scheme
                
                    // use the 'stars' template
                    this.$('.js-rate-area').append(this.compileTemplate('rating-stars'));
                    
                    // initialize the raty plugin.
                    this.$('#stars').raty({
                        path : this.getProperty('ratyImagePath'),
                        hints: ['1', '2', '3', '4', '5']
                    });
                }
                else { // we will default to 'thumbs up/down' scheme for all other choices
                    
                    var thumbsObject = {};
                    // read configured article feedback ratings from portal configuration
                    var feedbackRatingList = this.app.getPortalSetting("feedbackRatingList");
                    
                    if (feedbackControlToUse == 4) { // 'thumbs up/down' scheme
                                    
                        // use the label with the lower score value for thumb-down icon, and the other one 
                        // for thumb-up icon
                        if (feedbackRatingList[0].value < feedbackRatingList[1].value) {
                            
                            thumbsObject.downLabel = feedbackRatingList[0].name;
                            thumbsObject.downValue = feedbackRatingList[0].value;
                            thumbsObject.upLabel = feedbackRatingList[1].name;
                            thumbsObject.upValue = feedbackRatingList[1].value;
                        }
                        else {
                            thumbsObject.upLabel = feedbackRatingList[0].name;
                            thumbsObject.upValue = feedbackRatingList[0].value;
                            thumbsObject.downLabel = feedbackRatingList[1].name;
                            thumbsObject.downValue = feedbackRatingList[1].value;
                        }
                    }
                    else { // this means user chose one of the deprecated schemes from V10 portals - default to 'thumbs'
                        
                        thumbsObject.upLabel = this.app.language.getString('YES');
                        thumbsObject.downLabel = this.app.language.getString('NO');
                        
                        // store all available feedback rating values in an array since there could be more than two
                        var ratingsArray = [];
                        for(var i = 0; i < feedbackRatingList.length; i++)
                        {
                             ratingsArray[i] = feedbackRatingList[i].value;
                        }
                        // grab max and min values from the values array to be used in submitting the rating score
                        var maxValue = Math.max.apply(Math, ratingsArray);
                        var minValue = Math.min.apply(Math, ratingsArray);
                        
                        thumbsObject.upValue = maxValue;
                        thumbsObject.downValue = minValue;
                    }
                    
                    // compile and display the 'thumbs' template
                    this.$('.js-rate-area').append(this.compileTemplate('rating-thumbs', thumbsObject));
                }
        	}
        },

        _articleRetrieveError : function(){

        	/* In case of error, there is no point in showing the page if this component does not work.
        	 * Show the error page instead.
        	 */
        	var errorMessage = this.app.language.getString('ARTICLE_LOAD_ERROR');
        	this.app.showErrorPage(errorMessage);
        },

        _articleRatingRetrieved : function() {

            //Render the element with the article data.
            //this.render(article);
        },

        emailFriend : function(e) {

            e.preventDefault();

            var _this = this;

            var emailModelId = 8; // hard-coded value for backward compatibility
            try {
                emailModelId = this.getModel('email').id;
            }
            catch(e) {
                // Do nothing, we are already using default value of 8
            }

            var component = this.app.page.createComponent({

                name : 'standard.portal.form.email_friend',
                models : {email: {id: emailModelId}},
                properties : {articleId : this.articleId}

            }, function(component) {

                //Tell the current page to show modal containing the email friend component that we just downloaded.
                _this.app.page.showModal({

                    component : component
                });
            });
        },

        getAttachment : function(e) {

        	e.preventDefault();

        	var $inputTarget = $(e.target);
        	var attachmentId = $inputTarget.attr('id');

            this.articleModel.getAttachment({

                attachmentId : attachmentId,
                success : this._onAttachmentRetrieveSuccess,
                error : this._onAttachmentRetrieveError,
                context : this
            });
        },

        _onAttachmentRetrieveSuccess : function(data) {

            // If the CallInfo has a non-empty "redirectUrl" field, download the attachment.
            if (data.callInfo.redirectUrl) {

                // download a file by its URL (this is a jQuery plug-in, it does not pass any headers)
                $.fileDownload(
                    data.callInfo.redirectUrl,
                    {
                        httpMethod: "GET",
                        preparingMessageHtml: false,
                        failMessageHtml: this.app.language.getString('ATTACHMENT_LOAD_ERROR')
                    }
                );
            }
            else {
                this._onAttachmentRetrieveError();
            }
        },

        _onAttachmentRetrieveError : function() {

            alert(this.app.language.getString('ATTACHMENT_LOAD_ERROR'));
        },

        addAsFavorite : function(e) {

            e.preventDefault();

            var _this = this;

            this.favorite.addFavorite(this.article);

            //this.app.navigateToPage('favorites');
            //
            var component = this.app.page.createComponent({

                name : 'standard.portal.list.favorites',
                models : {"favorite": {id : this.favorite.id}}

            }, function(component) {

                //Tell the current page to show modal containing the list-favorites component that we just downloaded.
                _this.app.page.showModal({

                    component : component
                });
            });
        },

        onArticlePrintClick : function(e) {

            e.preventDefault();

            //Hide the global wrap.
            $('#global-wrap').hide();

            //Create the print wrap for the print version.
            var $printWrap = $(this.compileTemplate('print', {

                name : this.article.name,
                content : this.article.content,
                id : this.article.id,
                page_url : window.location.href
            }));

            console.log("print wrap", $printWrap);

            $("body").append($printWrap);

            window.print();

            //Show the actual page again.
            $printWrap.remove();

            $('#global-wrap').show();
        },

        onFeedbackSubmit : function(e) {

            e.preventDefault();

            var feedbackString = $(e.target).find('textarea').val();

            this.articleModel.sendFeedback({

                articleId : this.articleId,
                feedback : feedbackString,
                success : this._onFeedbackReceivedSuccess,
                error : this._onFeedbackReceivedError
            });
        },

        _onFeedbackReceivedSuccess : function() {

            this.$('form.article-feedback').val('');
        },

        _onFeedbackErrorSuccess : function() {

            this.$('form.article-feedback').val('');
        },

        onFeedbackTyping : function(e) {

            console.log('scroll!');

            var max = 100;
            var textareaEl = e.target;

            if(textareaEl.scrollHeight > max) {

                console.log('scroll height is more than max');

                if(textareaEl.style.overflowY != 'scroll') {

                    textareaEl.style.overflowY = 'scroll';
                }

                return;
            }

            /* Make sure element does not have scroll bar to prevent jumpy-ness */
            if (textareaEl.style.overflowY != 'hidden') { textareaEl.style.overflowY = 'hidden' }

            /* Now adjust the height */
            var scrollH = textareaEl.scrollHeight - 5;
            var actualHeight = parseInt(textareaEl.style.height.replace(/[^0-9]/g,''));

            console.log('scroll height', textareaEl.scrollHeight, actualHeight);

            if(scrollH > actualHeight) {

                console.log('scrollHeight is more');
                textareaEl.style.height = scrollH+'px';
            }
        },

        buildUrl : function(article) {

            return this.app.getPageUrl(this.getProperty("relatedArticlePage") || "article",
                                        article.id,
                                        this.slugify(article.name));
        },		

        onRateArticle : function(e) {

            e.preventDefault();

            // check what type of rating scheme this portal uses
            var feedbackControlToUse = this.app.getPortalSetting("feedbackControlToUse");
            var ratingScore = feedbackControlToUse == 5 ? this.$('#stars').raty('score') : $(e.target).attr('data-value') ;
            
            this.articleModel.assignRating({

                articleId : this.articleId,
                success : this._onRateSuccess,
                error : this.declareError,
                score : ratingScore,
                context : this
            });
        },

        _onRateSuccess : function() {

            this.$('.js-rate-area').html('<span class="egce-font-medium egce-p10">'+this.app.language.getString('THANKS_FOR_THE_RATING') +'</span>');
        },

		/**
         * This function is called when an agent clicks on "Add To Reply" button. This button will only
         * be present if the portal has been opened automatically through "Solve" button in agent console.
         * In that case, a cookie with the agent's window name will be saved in the portal. Therefore, we can access
         * the agent's window and pass article information to it for further processing.
         */
        onAddToReply : function() {

            // get the name of the agent's console window
            var mainWindowName = this.app.getCookie('mainWindowName');

            if(mainWindowName) {
                var mainWindow = window.open('', mainWindowName);

                // get current article page URL excluding any query parameters
                var pageUrl = window.location.href.split('?')[0];

                // article data to pass back to the agent's window
                var articleData = {
                    deptId : this.article.departmentId,
                    configurationId : this.app.getPortalId(),
                    article_id : this.article.id,
                    article_name : this.article.name,
                    article_url : pageUrl,
                    classifications : new Array()
                };
                if(this.page.getQueryString('USE_SOLVE') == 'YES')
                	articleData['addUsingSolve'] = true;

                // the below method of the agent's window will take care of the rest
                var retVal = mainWindow.callMethod("singleton", "getArticleDataFromWT", articleData).value;
            }
        },

        isHighlighted : function() {

            return this.app.page.getQueryString('fromQuery');
        },

		/** Save this article view context (related articles) in the browser */
        onArticleViewClick : function(e) {
            this.saveState('articleViewContext', 'article_view_related_article', true);
        },

        addToCRMCase : function(e) {
            e.preventDefault();

            if(!this._solutionAdded)
            {
            var crmCaseId = this._getCRMCaseId();

            this.articleModel.addToCRMCase({

                subject : this.article.name,
                articleId : this.articleId,
                crmCaseId : crmCaseId,
                success : this._onAddSolutionSuccess,
                error : this.declareError,
                score : $(e.target).attr('direction') == "up" ? 20 : 0,
                context : this
            });
            }
        },

        _getCRMCaseId : function(e) {
            var crmCaseId = "";
            var search = location.search.substring(0);
            if(search.indexOf("?") == 0)
                search = search.substring(1);
            var searchParams = search.split('&');
            for(var i=0;i<searchParams.length;i++)
            {
                var pair = searchParams[i].split('=');
                var name = pair[0];
                var val = pair[1];
                if(name == 'CUSTOM_CASEID')
                {
                    crmCaseId = val;
                    break;
                }
            }
            return crmCaseId;
        },

        _onAddSolutionSuccess : function() {

            $(".js-crmcase").hide();
            $("#crmaddsolution").removeClass("egce-hover");
            $("#crmaddsolution").css("cursor","default");
            $("#crmaddsolution").parent().removeClass("egce-hover");
            $("#crmaddsolution").html(this.app.language.getString('CRM_SOLUTION_ADDED'));
            //this.$('.js-crmcase').html('<span class="egce-font-super-small">'+this.app.language.getString('CRM_SOLUTION_ADDED') +'</span>');
            //this.$('.js-crmcase').removeClass('js-crmcase egce-hover');
        },
		
        onExternalUrlClick : function(e) {
        	
			if(!this.app.PORTAL_SETTINGS.showWarningMsgForExternalArticles || confirm(this.app.language.compileString("EXTERNAL_PAGE_WARNING"))){
				var $inputTarget = $(e.target);				
				// parse the search result url and event type from the data-link attribute 
				var accessLink = $inputTarget.attr('data-link');
				var accessQueryStr = accessLink.split('?')[1];
				if (!accessQueryStr)
					return;
				
				var linkAccessObject = helpers.parseQueryString(accessQueryStr);

				this.articleModel.logExternalUrlEvent({
					context : this,
					data : {
						url : linkAccessObject.url,
						type : linkAccessObject.type
					}
				});
			}
			else {
				return false;
			}
        }		
    });

    return ContentArticleComponent;
});
