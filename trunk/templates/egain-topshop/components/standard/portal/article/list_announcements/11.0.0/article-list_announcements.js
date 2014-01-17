 define(['core/component'], function(CoreComponent) {

    var ArticleListAnnouncementsComponent = CoreComponent.extend({

        name : 'article-list_announcements',

        events : {

            'click .js-load-more' : 'onLoadMoreClick',
            'click .js-article-view-click' : 'onArticleViewClick'
        },

        prepare : function() {

            // if announcements are not enabled in this portal configuration, hide this component
            var isEnableAnnouncements = this.app.getPortalSetting("enableAnnouncementsSection");
        	if (!isEnableAnnouncements) {
        		this.trigger("ready");
        		this.hide();
        		return;
        	}

            this.articleModel = this.getModel('article');

        	this.limit = this.getProperty('limit', 5);
            this.skip = this.getProperty('skip', 0);

        	this.articleModel.getAnnouncements({

        		success : this._onAnnouncementsArrive,
                error : this.declareError,
                limit : this.limit,
                context : this
        	});
        },

        _onAnnouncementsArrive : function(data) {

            var show_load_more = this._shouldShowLoadMore(data.announcementsActualCount);

            this.render({announcements:data.announcements, show_load_more:show_load_more});

    $("a").each(function() {
        $(this).attr("hideFocus", "true").css("outline", "none");
    });
        },

        onLoadMoreClick : function() {

        	//Increase the skip by the maximum limit.
            this.skip += this.limit;

            this.articleModel.getAnnouncements({

        		success : this._onAnnouncementsMoreArrive,
                limit : this.limit,
                skip : this.skip,
                context : this
        	});
        },

        _onAnnouncementsMoreArrive : function(data) {

        	//Hide the load more if appropriate.
            if(!this._shouldShowLoadMore(data.announcementsActualCount)) {

                this.$('.js-load-more').hide();
            }

            var dividerHtml = this.compileTemplate('divider',
                                                  {'top_entry_count':this.skip - this.getProperty('skip', 0)});

            this.$('ul').append(dividerHtml);

            _.each(data.announcements, function(announcement) {

                var rowHtml = this.compileTemplate('row', announcement);

                this.$('ul').append(rowHtml);

            }, this);

        },

        _shouldShowLoadMore : function(total_count) {

            return total_count > (this.limit + this.skip);
        },

        /** Save this article view context in the browser */
        onArticleViewClick : function(e) {
			e.preventDefault();
			this.elementClicked = e.target;

			var announcementItem = $(this.elementClicked).parent("li");

			if(announcementItem.find(".announcement-content").text().length > 0 && announcementItem.find(".announcement-content").is(":visible")){
				$(".js-announcement-accordion").hide();
				return;
			}else if(announcementItem.find(".announcement-content").text().length > 0 && !announcementItem.find(".announcement-content").is(":visible")){
				$(".js-announcement-accordion").hide();
				announcementItem.find(".js-announcement-accordion").show();
				return;
			}

			this.articleModel = this.getModel('article');

            this.articleId = $(e.target).attr("rel");
            //Retrieve the article.
            this.articleModel.retrieve({

                articleId :  this.articleId,
                //If successful, then run the articleRetrieved function.
                success : this._onArticleRetrieveSuccess,
                error : this._articleRetrieveError,
                //context
                context : this

            }, this);




        },
		_onArticleRetrieveSuccess : function(article){
            //Save the reference.
            this.article = article;
         	this.articleName = this.article.name;
         	this.articleContent = this.article.content;

			var announcementItem = $(this.elementClicked).parent("li");
			announcementItem.find(".announcement-content").html(this.articleContent);
			announcementItem.find(".js-announcement-accordion").show();

		},
		_articleRetrieveError : function(){
			alert("_articleRetrieveError");
		},
        buildUrl : function(announcement) {

           return this.app.getPageUrl(this.getProperty("articlePage") || "article", announcement.id,
                                        this.slugify(announcement.name));
        }
    });

    return ArticleListAnnouncementsComponent;
});


