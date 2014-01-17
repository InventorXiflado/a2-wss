define(['underscore',
        'backbone',
        'jquery', 
        'core/section', 
        'core/helpers'], 

function(_, Backbone, $, Section, helpers) {

    var Page = Backbone.View.extend({ 
        
        className : 'egce-page',

        initialize : function(pageManifest, wrapper_el, pageArguments, pageQueryString, pageInitVar) {
            
            //Update the current app's page.
            app.page = this;

            this.app = app;
            this.qs = pageQueryString || {};

            var wrapperElement = wrapper_el ? $(wrapper_el) : $("#global-wrap");

            this.setArguments(pageArguments);
            
            //Append the page element into the wrapper.
            wrapperElement.html(this.$el);
            
            // On every page load, set the meta description tag in the header with portal's description as content
            if(this.app.getPortalInfo('description')) {
            	helpers.createOrUpdateMetaTag('description', this.app.getPortalInfo('description'));
            }
            else // if no description exists for this portal, remove the tag
            {
            	$('meta[name="description"]').remove();
            }
            
            // On every page load, remove meta keywords tag (no harm if it's not there)
            // because keywords will only be present in certain articles.
            $('meta[name="keywords"]').remove();
            
            /* Populate the page title with a generic title stored in the language file.
             * If page specific title exists (like topic name or article name), it will
             * be overwritten when the corresponding component loads. 
             */
            if(this.app.language.isReady) {
            	document.title = this.app.language.compileString("PAGE_TITLE");
            }

            this.info = pageManifest;
            this.manifest = pageManifest;
            this.sections = this.info.sections;
            this._sectionCount = _.keys(this.sections).length;
            this.initVar = pageInitVar;
            
            //Initialize the section ready counter.
            this._sectionReadyCount = 0;

            this.bind('ready', this._populateIdReferences, this);

            //TODO : I think the load function call should be in the app
            //instead of the page object. (Gary)
            this.load();

            //this.bind('ready', this._connectComponents, this);
        },

        load : function() {

            this.applyLayout(this.manifest.layout);
        },
        
        applyLayout : function(layout_name){
            
            var page = this,
                paths = helpers.generateLayoutPaths(layout_name);

            //Retrieve the layout files.
            require([paths.html, paths.css],
                     _.bind(this._onLayoutArrive, this));
        },

        _onLayoutArrive : function(html, css) {
            
            this.layoutHtml = html;
            
            //Remove the layout style of the previous page, if there's one.
            $('#layout-style').remove();
        
            //Apply style.
            helpers.applyStyle(css, this.$el.parents('html'), 'layout-style');

            //Render the page upon layout arrival.
            this.render();

            //Trigger 'layout' event.
            this.trigger('layout');
            
            //Add the layout name into the body element for easier debugging.
            $('body').attr('data-layout', this.manifest.layout);
            
            //Apply the current's page style
            this._applyPageStyles();
        },

        _applyPageStyles : function() {

            for(var selector in this.manifest.styles) {

                if(selector === '__root__') {
                    
                    this.$el.css(this.manifest.styles[selector]);

                } else {

                    this.$el.find(selector).css(this.manifest.styles[selector]);
                }
            }
        },

        //Injects the page.
        render : function(){
            
            var page = this;
            var _this = this;
            this._sections = {};

            //Put the layout into the page
            this.$el.html(this.layoutHtml);
            
            //Get all sections wrapper on the layout.
            var $sections = $("*[section]");
            
            //Go through each sectionElements and create section object 
            //for them.
            $sections.each(_.bind(this._createSection, this));
        },

        _createSection : function(index, sectionElement) {

            var $section = $(sectionElement),
                sectionName = $section.attr('section');
            
            //Get the manifest based on the section that we have.
            var sectionManifest = this._getSectionManifest(sectionName)
                                  || {};
            
            var componentManifests = (sectionManifest) ? sectionManifest
                                                    .components : [];

            var sectionId = sectionManifest.id;
            
            //Check if the section is cached.
            if(app.cache.isSectionCached(sectionId)) {
                
                var section = app.cache.getCachedSection(sectionId);
                
                //Replace the empty section wrapper element with the 
                //cached section element.
                $section.replaceWith(section.$el);
                // Let section decide on special handling when cached copy is used.
                section.useCachedCopy();

                //Increment section count.
                this._incrementSectionReadyCount();

            } else {


            var section = new Section({el:$section,
                                       page:this,
                                       manifest:sectionManifest});
            
            //Save a name-based reference map.
            this._sections[sectionName] = section;
            

            //Cache the components if we can.
            if(sectionManifest.cacheable && sectionId) {
                
                console.log("CACHING SECTION!", sectionManifest);
                //Cache the section if it's cacheable
                app.cache.cacheSection(sectionId, section);
            }


            if(section.isReady) {

                this._incrementSectionReadyCount();

            } else {

                section.bind('ready', this._incrementSectionReadyCount, this);
            }
            }
        },

        _getSectionManifest : function(name) {
            
            var sectionManifests = this.manifest.sections;

            for(var i in sectionManifests) {
                
                var sectionManifest = sectionManifests[i];
                
                if(sectionManifest.name === name) { 
                    
                    //If the section has a shared section key, it means it
                    //will take the section definition from the shared sections
                    //definition of the manifest.
                    if(sectionManifest.shared_section) {
                    
                        //Get the section definition from the shared section.
                        var sharedSectionManifest = 
                                app.manifest
                                    .get('shared_sections')
                                    [sectionManifest.shared_section];
                        
                        //put the section name into shared section object
                        sharedSectionManifest.name = sectionManifest.name;

                        return sharedSectionManifest;
                    }

                    return sectionManifest;
                }
            }
        },

        onSectionReady : function(section) {

            this._incrementSectionReadyCount();
        },

        _incrementSectionReadyCount : function() {
            
            //Increment section ready count.
            this._sectionReadyCount++;

            console.log('section ready count!', this._sectionReadyCount, this._sectionCount);
            
            //If all sections are ready, then trigger the page ready event.
            if(this._sectionReadyCount === this._sectionCount) {
                
                this.trigger('ready');
            }
        },

        getSections : function(){

            return this._sections;
        },

        getSection : function(name){

            return this._sections[name];
        },

        getComponent : function(section, name){

            return this.getSection(section).getComponent(name); 
        },

        getComponentById : function(id) {
            
            if(!this._components_by_id) return null;

            return this._components_by_id[id];
        },

        getAllComponents : function() {

            return this._components_by_id;
        },
            
        /**
        
            Utility function of page object that creates
            an instance of a component.

        **/
        createComponent : function(componentManifest) {

            var name;
            var info;
            var callback;
            var context;
            var info_passed = false;
            var wrapper_element;
            var version;
            
            //Analyze arguments
            _.each(arguments, function(arg) {
                    
                if(_.isString(arg)) 
                    name = arg;
                else if(_.isFunction(arg)) 
                    callback = arg;
                else if(_.isElement(arg))
                    wrapper_element = arg;
                else if(_.isObject(arg)) {
                    
                    //The first object that is passed is manifest object,
                    //the second one is context.
                    if(!info_passed) {

                        info = arg;
                        info_passed = true;

                        if(info.name) 
                            name = info.name;
                    } else { 

                        context = arg;
                    }
                }
            });

            this.downloadComponentClass(name, function(componentClass, componentManifest) {
                
                //console.log("COMPONETN CLASS", componentClass);

                var component = new componentClass({
                
                    page: this,
                    info : info,
                    el : wrapper_element
                });
                    
                //Create a reference to the app object.
                component.app = app;
                
                //TODO : apply the styles correctly (not only root wrapper element)
                if(info.styles) {

                    $(component.el).css(info.styles);
                }

                //Load the component.
                component.load(componentManifest);
                
                callback.call(context, component);

            }, this, componentManifest);
        },

        downloadComponentClass : function(name, callback, context, componentManifest) {

            console.log("IN PAGE", name);

            var paths = componentManifest.version ? helpers.generateNewComponentPaths(name, componentManifest.version) : helpers.generateNewComponentPaths(name);

            //console.log("DOWNLOAD PATHS", JSON.stringify(paths));

            require([paths.js], function(componentClass) {

                //console.log("DOWNLOAD CLASS", componentClass);

                callback.call(context, componentClass, componentManifest);
            });
        },

        _populateIdReferences : function() {
            
            console.log("POPULATING ID REFERENCES READY");

            this._components_by_id = {};

            for(var name in this.getSections()) {

                var section = this.getSection(name);
                
                _.each(section.getComponents(), function(component) {

                    this._components_by_id[component.getId()] 
                                                        = component;        
                }, this);
            }
        },

        _connectComponents : function() {
            
            //_.invoke(this.getAllComponents(), 'connectActions');
        },

        setArguments : function(_arguments) {

            this._arguments = _arguments;

        },

        getArgument : function(index) {

            return this._arguments[index];
        },

        showModal : function(options) {

            var modal = new _Modal({
                
                component : null
            });

            modal.render();
            
            if(options.component) {

                modal.insertComponent(options.component);
            }

            $('body').append(modal.$el);

            this._currentModal = modal;
        },

        closeModal : function() {

            this._currentModal && this._currentModal.close();
        },

        getQueryString : function(queryKey) {

            if (queryKey) {
            	return this.qs[queryKey];
            }
            else {
            	return this.qs;
            }
        },

        setQueryString : function(qs) {

            this.qs = qs;
        }, 

        scrollToTop : function() {

            $(window).scrollTop(0);
        }
    });

    //This is the view class that encapsulates modal.
    var _Modal = Backbone.View.extend({
            
        className : 'egce-modal-overlay',

        events : {
            
            'click .egce-modal-wrap' : 'stopPropagation',
            'click .egce-modal-close-button' : 'onCloseButton'
        },

        initialize : function(options) {

            this.component = options.component;
        },

        render : function() {
            
            //Hide scrollbar on body
            $('body').css({'overflow':'hidden'});
            $('html').css({'overflow':'hidden'});

            this.$el.css({

                'margin-top' : $(window).scrollTop(),
                'margin-left' : $(window).scrollLeft()
            });

            this.$el.html([

                '<div class="egce-modal-overlay-background"></div>',
                '<div class="egce-modal-overlay-middle">',
                    '<div class="egce-modal-wrap">',
                        '<div class="egce-modal-content"></div>',
                        '<div class="egce-modal-close-button">x</div>',
                    '</div>',
                '</div>'

            ].join(''));
        },

        insertComponent : function(component) {

            this.$('.egce-modal-content').append(component.$el);
        },

        onCloseButton : function() {
            
            this.close();
        },
        
        stopPropagation : function(e) {

            e.stopPropagation();
        },

        close : function() {

            //Reallow scrollbar on body
            $('body').css({'overflow':''});
            $('html').css({'overflow':''});

            this.remove();

            delete app.page['_currentModal'];
        }
    });

    return Page;
});
