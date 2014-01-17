define(['underscore',
        'core/component',
        'core/models/topic',
        'plugins/cookies/init'],

function(_, BaseComponent, Topic){

    var MenuTreeComponent = BaseComponent.extend({

        name : "menu-tree",

        events : {

        	"click a" : "onMenuClick"
        },

        prepare : function(){

            /**


            **/
            var root_topics = (new Topic).getAllTopics({

                success : this._onTopicsArrive,
                context : this
            });
        },

        _onTopicsArrive : function(data) {

	      	this.render({topics:data.topics}, {

                li : "<li><a id='{{id}}' href='#topic/{{id}}/{{prettify name}}'>{{name}}</a><ul>{{#children}} {{>li}} {{/children}}</ul></li>"
            });

	        this._initMenu();

	        this._identMenu();
        },

        _initMenu : function() {

			//style for main topic (if any)
			this.$(".root")
                .children('li')
                .children("a")
                .addClass("topic");

            //Hide all sub menus
            this.$("ul:not(.root)").hide();

            //check for opened menu options
            var opened_topics = this.getState('opened-topics');

            if(opened_topics) {

                var _this = this;

                $.each(opened_topics, function(index, value) {

                    value && _this.$("#"+value).next("ul").show();
                });

	      	}//else
        },
        //menu identation
        _identMenu : function(){

        	var ident = { num : 10 }; //static value to be incremented

        	$(".root li").each(function(){

        		if($(this).find('a').hasClass('topic')){
        			ident.num = 10;
        		}

        		$(this).find("ul").each(function(){

	        		$(this).find("a").each(function(){

	        			$(this).css("cssText","padding-left: "+ident.num+"px !important;");
	        		});//find(a)

        		ident.num += 5; //increase identation for each level
        		});//find(ul)

        	});


        	$('.root a').has('ul:has(li)').each(function(){

        		$(this).prepend("> ");
        	});
        },

        onMenuClick : function(e) {

            var $target = $(e.target);

            //If this as_filter property is true, then we have to
            //send the topic filter action.
            if(this.getProperty('as_filter')) {

                var id = $target.attr('id');

                this.send('egain11.product.topic.filter', id);
            }

            if(!this._hasChildren($target)) {

                return true;
            }

            //Prevent link click default behavior.
        	e.preventDefault();

            //Get all opened topic ids.
        	var opened_topics = this.getState('opened-topics') || [];

        	//check if element have submenus on it.
        	var $submenu = $target.next("ul");

        	//Show/hide submenus.
        	if($submenu.is(":visible")) {

        	 	$submenu.slideUp();

                //Remove item from array.
                opened_topics = _.without(opened_topics, $target.attr('id'));

        	} else {

        	 	$submenu.slideDown();

                //Add the opened topic's id to the opened_topics
        	 	opened_topics.push($target.attr("id"));
        	}

            //Update cookie list.
            this.saveState('opened-topics', opened_topics);
        },

        _hasChildren : function($target) {

            return !!$target.siblings('ul:first').children('li').length;
        }
    });

    return MenuTreeComponent;
});
