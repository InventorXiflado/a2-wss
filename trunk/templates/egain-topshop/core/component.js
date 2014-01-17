define(['underscore',
        'backbone',
        'jquery',
        'less',
        'handlebars',
        'amplify',
        'core/helpers'],

function(_,
        Backbone,
        $,
        less,
        Handlebars,
        amplify,
        Helpers) {

    var CoreComponent = Backbone.View.extend({

        //parser for the component
        _lessParser : new less.Parser(),

        initialize : function(){
            //Throw error if a component does not have a name.
            if(!this.name)
                throw new Error('A component must have a name variable.');

            this.manifest = this.options.info;

            //Assign the app instance to the component.
            if(this.options.info)
                this.info = this.options.info;
            else
                this.info = {};

            if(this.options.page) {

                //Create the reference to both app and page.
                this.page = this.options.page;
                this.app = this.page.app;
            }

            if(this.options.app) {

                this.app = this.app;
            }

            if(this.options.baseUrl) {

                this._baseUrl = this.options.baseUrl;
            }

            this.config = this.info;
            this.portalId = this.app.getPortalId();

            if(this.manifest) {

                //Assign the component name.
                this.name = this.options.info.name;

                this.properties = this.options.info.properties || {};

                //Assign the component receives.
                this.actions = this.options.info.actions;
            }

            //every component will have a class called component
            $(this.el).addClass('component ' + this.name.replace(/\./g, '-')).attr('component-name', this.name);

            if(this.info && this.info.id) {

                $(this.el).attr('picasso-id', this.info.id);
            }

            this._setEvents();
            this._applyStyle();
            this._attachReceiveActionCallbacks();
        },

        //Load the component's dependencies (*.html, *.css, *.js)
        load : function(componentManifest){

            if(!this.app.language.isReady) {

                this.app.language.bind('ready', this.load, this);

                return;
            }

            var paths = (componentManifest && componentManifest.version)
                        ? Helpers.generateNewComponentPaths( this.name, componentManifest.version, this._baseUrl)
                        : Helpers.generateNewComponentPaths( this.name, '11.0.0', this._baseUrl);

            //While we're waiting for the dependencies to arrive,
            //let's show the animated loading gif as a placeholder.
           // this._showLoadingImage();

            //TODO : remove this hell. Every component
            //would load their own language file, not only search results.
            if(this.name == 'search-results') {
                //Load the HTML, CSS, and the language files of the component.
                require([paths.html, paths.css, paths.lang],
                        _.bind(this._onDependenciesArrival, this));
            } else {
                //Get the HTML, CSS, and the language file.
                require([paths.html, paths.css],
                        _.bind(this._onDependenciesArrival, this));
            }
            return this;
        },

        _setUp : function(html, css, lang) {

            var _this = this;

            //Wrap it in a document fragment.
            this.$html = $(html);

            //Check if the component has its HTML text correctly
            //containing template script tags. If it has, get the one
            //with the name `main`.
            if(this.hasTemplate()) {

                this.html = this.getTemplate('main');

            } else {

                this.html = html;
            }

            //compile the css
            //this.css = css;

            //Compile the theme (a LESS file) to CSS.
            this._lessParser.parse(css, function(err, tree) {

                //Do some LESS rules namespacing (prepending it with the name
                //of the component) before compiling to CSS
                var rules = tree.rules;

                for(var i = 0; i < rules.length; i++) {

                    var rule = rules[i];
                    var selector = rule.selectors[0];
                    var element = selector.elements[0];

                    //Prepend with .component.<component-name> class selector
                    element.value = '.component.' + _this.name.replace(/\./g, '-') + ' ' + element.value;
                }

                //and put the compiled css into an attribute
                _this.css = tree.toCSS();

            });

            //apply style
            Helpers.applyStyle(this.css, $(this.el).parents("html"), this.name + '-style');

            this.lang = lang || {};
        },

        //Apply the styles to the component.
        _applyStyle : function() {

            _.each(this.manifest.styles, function(styles, selectorName) {

                //Apply selector with the name __root__ to the component's
                //root (wrapper) element.
                if(selectorName == "__root__") {

                    this.$el.css(styles);

                } else {

                    //TODO : this will only apply to elements that
                    //appear on the first render. any subsequent elements
                    //added dynamically after 'ready' event
                    //will not be styled this way.
                    //we should create a style tag instead.
                    this.bind('ready', function() {

                        console.log('Applying to', selectorName);
                        this.$(selectorName).css(styles);

                    }, this);
                }

            }, this);
        },

        _attachReceiveActionCallbacks : function() {

            _.each(this.receiveActions, function(callbackName, actionName) {

                this.bind('action:'+actionName, function(arg1) {

                    console.log('action arrives!', arg1);

                    this[callbackName](arg1);

                }, this);

            }, this);
        },

        _onDependenciesArrival : function(html, css, lang) {

            //attach deps (html, css) and run the prepare function
            this._setUp(html, css, lang);

            //trigger prepare event
            this.trigger('prepare');

            //Run the prepare function.
            this.prepare();

            this.isReady = true;

            this.trigger('ready');


        },

        prepare : function() {

            this.render();
        },

        send : function() {

            //Every action is basically a Backbone event
            //namespaced with "action:".
            var action_name = arguments[0];
            var list = ["action:" + action_name];

            for(var i = 1, _ln = arguments.length; i < _ln; i++)
                list.push(arguments[i]);

            console.log("SEND : ", list);

            var page = this.page;
            console.log("PAGE", page);

            if(this.actions) {

                var target_component_ids = this.actions[action_name];
            } else {

                var target_component_ids = [];
            }

            console.log("Sending action", action_name, "to", target_component_ids);

            //Go through each of the component ids
            _.each(target_component_ids, function(target_id) {


                //target component
                var tc = page.getComponentById(target_id);

                console.log('sending to', target_id, tc, page._components_by_id);

                tc && tc.trigger(list[0], list[1]);//.apply(tc, list);

            }, this);
        },

        receive : function(ev, fn, context) {

            //Every action is basically a
            //Backbone event namespaced with "action:".
            return this.bind("action:" + ev, fn, context);
        },

        getElement : function(){

            return this.el;
        },

        compile : function(html, data, partials){

            //Register the partials.
            _.map(partials, function(value, key) {

                Handlebars.registerPartial(key, value);
            });

            var _this = this;

            //Register the internationalization helper.
            Handlebars.registerHelper('i18n', function() {

                var name = arguments[0],
                    args = _.rest(arguments);

                var lang_str = _this.lang[name] || '',
                    str = Handlebars.compile(lang_str)(data);

                return new Handlebars.SafeString(str);
            });

            //Register the prettify helper.
            Handlebars.registerHelper('prettify', Helpers.prettify);

            //Property accessor
            Handlebars.registerHelper('property', function(key, defaults) {

                var value = _this.getProperty(key) || defaults || "";

                return new Handlebars.SafeString(value);
            });

            //Putting subtemplate
            Handlebars.registerHelper('sub', function(name, data) {

                var sub_html = _this.compile(_this.getTemplate(name),
                                             data);

                return new Handlebars.SafeString(sub_html);
            });

            //Puts another page's url into the rendered template.
            Handlebars.registerHelper('pageUrl',
                                        _.bind(this.app.getPageUrl, this.app));


            //Helper to call a function of the component.
            Handlebars.registerHelper('call', function(functionName) {

                //get the function
                var fn = _this[functionName];

                //call it
                return fn.apply(_this, _.rest(arguments));
            });

            //Get language string.
            Handlebars.registerHelper('lang', function(stringName) {

                //Get the language string from the language object
                //of the application object.
                var langStr = _this.app.language.getString(stringName) || '';
                var args = _.rest(arguments);
                var argObject = {};

                for(var i = 0; i < args.length; i+=2) {

                    if(typeof args[i+1] !== "undefined") {
                    	argObject[args[i]] = args[i+1];
                    }
                }

                return new Handlebars.compile(langStr)(argObject);
            });

            //hasProperty block helper
            Handlebars.registerHelper('hasProperty', function(key, fn, elseFn) {

                if(typeof _this.getProperty(key) !== "undefined") {

                    return fn();

                } else {

                    return fn.inverse();
                }
            });

            //hasProperty block helper
            Handlebars.registerHelper('getOrDefault', function(value, defaults) {

                if(typeof value !== "undefined") {

                    return value;

                } else {

                    return defaults;
                }
            });

            return Handlebars.compile(html)(data);
        },

        renderTemplate : function(name, data) {

            //TODO : the use of this function is not clear.
            var html = this.compile.apply(this, arguments);

            //this.render();

            return html;
        },

        compileTemplate : function(name, data) {

            return this.compile(this.getTemplate(name), data);
        },

        render : function(){

            var template;
            var data;
            var partial;

            //if the first argument is a string,
            //then that string is the template string.
            //
            //example : this.render('{{name}} is cool.', {name:'John'});

            if(_.isString(arguments[0])) {

                template = arguments[0];
                data = arguments[1];
                //partial = arguments[2];

            } else {

                template = this.html;
                data = arguments[0];
                //partial = arguments[1];
            }

            //Compile the component HTML with the data that is provided.
            //and inject it.
            this.inject(this.compile(template, data, partial));

            //Automatically trigger 'ready'
            this.trigger('ready');

            return this;
        },

        getTemplate : function(name) {

            return unescape(this.$html.filter('script[name="'+name+'"]')
                            .html());
        },

        hasTemplate : function() {

            return this.$html.filter('script[name="main"]').length > 0;
        },

        inject : function(compiledHtml) {

            //Put the compiled html to the element.
            this.$el.html(compiledHtml);

            return this;
        },

        getProperty : function(key, defaults) {

            var value = this.properties[key];

            //If the value starts with a dollar sign, that means the value
            //will be a dynamic value.
            if(_.isString(value)) {

                return this.app.manifest.compileValue(value);

            } else if(_.isNumber(value)) {

                return value;

            } else {

                return defaults;
            }
        },

        /**
            Connect actions of the component to the target components.
        */
        connectActions : function() {

            var actions = this.actions;

            for(var name in actions) {

                _.each(actions[name], function(target_component_id) {

                    console.log(target_component_id);

                    var target_component
                            = this.page.getComponentById(target_component_id);

                    target_component.connectAction(name, this);

                }, this);
            }
        },

        connectAction : function(action_name, origin_component) {

            var event_name = 'action:' + action_name;

            //Bind to the origin component of the event name.
            origin_component.bind(event_name,
                                  this.getActionCallback(action_name),
                                  this);
        },

        getActionCallback : function(action_name) {

            if(this.receiveActions)
                return this[this.receiveActions[action_name]];
        },

        getId : function() {

            return this.manifest.id;
        },

        /**
         * Enables a component to save JSONifyable values in the browser.
         *
         *  Example :
         *  this.saveState('some-key', [1001, 1002, 1003], false);
         */
        saveState : function(key, value, isGlobal) {

            this.app.saveInBrowser(key, value, isGlobal, this.name);
        },

        /**
         * Enables a component to retrieve values that were stored via saveState().
         *
         * Example :
         * var value = this.getState('some-key', null, false);
         */
        getState : function(key, default_value, isGlobal) {

        	return this.app.getSavedValue(key, default_value, isGlobal, this.name);
        },

        /**

            Declares that the component cannot achieve ready state for variety of reasons,
            such as model error.

            Example:
            this.declareError(this.ERROR_CODES.API_ERROR);
        */
        declareError : function(error_code, message) {

            if(message == null || message == '')
            {
                message = 'Something wrong happened with this component.';
            }
            else
            {
                message = this.app.language.compileString(message);
            }

            //For now, we will just show "Oops" message.
            this.$el.html(message);
        },

        ERROR_CODES : {

            API_ERROR : 0,
            CONFIG_ERROR : 1
        },

        /**

            A proxy method to the app's router navigate.
        **/
        navigate : function(url, options) {

            this.app.router.navigate(url, options);
        },

        /**

            var query = "where can i view my bill";

            this.navigateToPage('search', query);

        **/
        navigateToPage : function(pageName) {

            var url = this.app.getPageUrl
                              .apply(this.app,
                              [pageName].concat(_.rest(arguments)));

            if(!url)
                return;

            console.log("navigate to page:", url);

            //navigate to the actual url
            this.navigate(url, {trigger:true});
        },

        /**

            Locks the page from changing (such as from back button or
            closing). Usually used in components with long input sessions
            such as casebase to make sure user do not go out of the page
            without knowing the consequences.

            Usage:

            this.lockPage({

                message : "You will lose your casebase answers. Are you sure
                you want to go out from the session?"
            });


            Make sure to unlock the page when the session is deemed done.

            Usage:

            this.unlockPage();

        **/
        lockPage : function() {


        },

        _showLoadingImage : function() {

            //TODO : Do this somewhere else.

            var opts = {

              lines: 10, // The number of lines to draw
              length: 3, // The length of each line
              width: 2, // The line thickness
              radius: 4, // The radius of the inner circle
              rotate: 0, // The rotation offset
              color: '#aaa', // #rgb or #rrggbb
              speed: 1.3, // Rounds per second
              trail: 60, // Afterglow percentage
              shadow: false, // Whether to render a shadow
              hwaccel: false, // Whether to use hardware acceleration
              className: 'spinner', // The CSS class to assign to the spinner
              zIndex: 2e9, // The z-index (defaults to 2000000000)
              top: 0, // Top position relative to parent in px
              left: 0 // Left position relative to parent in px
            };
            //var target = document.getElementById('foo');
            this._spinner = new Spinner(opts).spin(this.el);
            //this.$el.append('<span style="color:#ccc;">Loading..</span>');
        },

        _hideLoadingImage : function() {
            this._spinner.stop();
        },

        //Hide the component.
        hide : function() {

            this._isHidden = true;
            this.$el.hide();
        },

        show : function() {

            this._isHidden = false;
            this.$el.show();
        },

        slugify : function(unslugged) {

            return Helpers.prettify(unslugged);
        },

        //TODO : remove this.
        _getId : function() {

            var id = window.location.hash.split('/')[1];


            if(id && id.indexOf(':') == 0)
                return null;

            return id;
        },

        getModel : function(name) {

            try {

                var compModelManifests = this.manifest.models || {};
                var compModelManifest = compModelManifests[name];

                //Get the actual model from the application by id
                return this.app.getModelById(compModelManifest.id);

            } catch(e) {


                throw new Error("Component " + this.name + " needs a model with the name " + name);
            }
        },

        /**
         *
         * Gets the portal's configuration object. If configKey is passed, then the value
         * of that exact configKey on the portal's configuration will be returned.
         *
         */
        getPortalConfiguration : function(configKey, defaultValue) {

            return this.app.PORTAL_SETTINGS[configKey] || defaultValue;
        },

        isWithinModal : function() {

            return true;
        },

        closeIfWithinModal : function() {

            if(!this.isWithinModal()) return;

            this.page.closeModal();
        },

        _setEvents : function() {

            var events = _.clone(this.events) || {};

            //Add custom event.
            events['click'] = 'onPlaceholderInputFocus';
            events['blur input.egce-js-placeholder'] = 'onPlaceholderInputBlur';


            this.delegateEvents(events);
        },

        onPlaceholderInputFocus : function(e) {

            var $input = $(e.target);

            if($input.val() == $input.attr('data-placeholder')) {

                $input.val('');
            }
        },

        onPlaceholderInputBlur : function(e) {

            var $input = $(e.target);

            if($input.val() === '') {

                $input.val($input.attr('data-placeholder'));
            }
        }
    });


    return CoreComponent;
});
