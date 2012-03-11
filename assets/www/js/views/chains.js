(function() {

    var Backbone = window.Backbone;
    var WIN_WIDTH = 480; // Math.round(window.innerWidth * 1.5);
    var WIN_HEIGHT = 762; // Math.round(window.innerHeight * 1.5);
    var HOR_DOMINANCE = 0.7;
    var VER_DOMINANCE = 0.6;
    var CHAIN_HEAD_PLACEHOLDERS = 5;
    var CHAIN_HEAD_MIDDLE = 2;
    var PADDING_PX = 20;
    var FIRST = 0;
    var LAST = CHAIN_HEAD_PLACEHOLDERS - 1;
    var API_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/chains/heads'; // 'dummy-chains.json'

    var ChainHead = Backbone.Model.extend();

    var ChainHeadView = phunt.views.base.extend({

        className: 'ph-chainHead',

        events: {
            'fastclick': function() {

                if (this.parentCategoryView.isCurrentlyFocused && this.isCurrentlyFocused)
                    phunt.navigation.go('location', this.model.get('resourceUrl'));
                else if (this.parentCategoryView.isCurrentlyFocused)
                    this.parentCategoryView.focusChainHeadAnimated(this.model);
                else
                    this.parentCategoryView.parentCategoryCollectionView.focusCategory(this.parentCategoryView);

            }
        },

        initialize: function(options) {

            this.index = options.index;
            this.parentCategoryView = options.parentCategoryView;
            this.$el.css({
                width: (WIN_WIDTH * HOR_DOMINANCE) + 'px',
                left: options.parentCategoryView.getLeftForIndex(this.index) + 'px'
            });
            
            this.$el.append($('<div class="ph-roughDistance ph-title"></div>'));
                        
            this.addFastButtons();

        },

        prepareForModel: function(chainHead) {

            if (!chainHead) {
                this.$el.removeClass('ph-populated');
                this.$el.find('.ph-roughDistance').text('');
                return;
            }

            console.log('ChainHeadView#' + this.index + ' preparing for ChainHead#' + chainHead.id);

            this.$el.addClass('ph-populated');
            this.$el.find('.ph-roughDistance').text('loading');

        },

        attachToModel: function(chainHead) {

            if (!chainHead)
                return; // it's OK, we didn't want a new model anyway

            console.log('ChainHeadView#' + this.index + ' attaching to ChainHead#' + chainHead.id);

            this.model = chainHead;

            this.$el.addClass('ph-populated');
            this.$el.css({ backgroundImage: 'url("' + this.model.get('gridPictureUrl') + '")' });
            this.$el.find('.ph-roughDistance').text(this.model.get('roughDistance'));

        },

        detachFromModel: function() {

            if (!this.model)
                return; // already detached or never attached

            console.log('ChainHeadView#' + this.index + ' detaching from ChainHead#' + this.model.id);

            this.model = null;

            this.$el.css({ backgroundImage: 'url("img/empty.png")' }); // we actually have to set a new image here to clear the background on Android
            this.$el.find('.ph-roughDistance').text('');

        }

    });

    var ChainHeadCollection = Backbone.Collection.extend({

        model: ChainHead

    });

    var Category = Backbone.Model.extend({

        initialize: function() {
            this.set({ // turn the attribute into a Collection
                chainHeads: new ChainHeadCollection(this.get('chainHeads'))
            });
        }

    });

    var CategoryCollection = Backbone.Collection.extend({

        url: API_ENDPOINT,

        model: Category

    });

    var CategoryView = Backbone.View.extend({

        initialize: function(options) {

            this.index = options.index;
            this.parentCategoryCollectionView = options.parentCategoryCollectionView;

            this.$el.addClass('ph-category');
            this.$el.css({ // align this category to its proper place with its index
                width: WIN_WIDTH + 'px',
                height: (WIN_HEIGHT * VER_DOMINANCE) + 'px',
                top: ((WIN_HEIGHT * (1 - VER_DOMINANCE)) / 2 + (WIN_HEIGHT * VER_DOMINANCE) * this.index) + 'px'
            });

            this.chainHeads = this.model.get('chainHeads');
            this.chainHeadViews = [];

            this.initializeChainHeads();

        },

        initializeChainHeads: function() {

            var $container = $('<div class="ph-container"></div>');

            $container.css({
                top: Math.round(PADDING_PX / 2) + 'px',
                left: 0,
                bottom: Math.round(PADDING_PX / 2) + 'px',
                right: 0
            });

            var that = this;

            _.each(_.range(CHAIN_HEAD_PLACEHOLDERS), function(index) {

                var correspondingModel = that.chainHeads.at(index - CHAIN_HEAD_MIDDLE);
                var chainHeadView = new ChainHeadView({
                    index: index,
                    parentCategoryView: that
                });

                that.chainHeadViews.push(chainHeadView);

                $container.append(chainHeadView.$el);

                chainHeadView.attachToModel(index > FIRST && index < LAST ? correspondingModel : null);
                chainHeadView.prepareForModel(index === FIRST || index === LAST ? correspondingModel : null);
                chainHeadView.isCurrentlyFocused = index === CHAIN_HEAD_MIDDLE;

            });

            this.$el.append($container);

        },

        getLeftForIndex: function(index) {

            return Math.round((WIN_WIDTH * (1 - HOR_DOMINANCE)) / 2 + WIN_WIDTH * HOR_DOMINANCE * (index - CHAIN_HEAD_MIDDLE) + (index - CHAIN_HEAD_MIDDLE) * PADDING_PX);

        },

        focusChainHeadAnimated: function(chainHead) {

            var that = this;
            var indexOf = this.chainHeads.indexOf(chainHead);

            if (indexOf === -1)
                return; // can't focus nonexistant chainHead instance

            if (this.chainHeadBeingFocused)
                return;

            var viewIndex = _.find(this.chainHeadViews, function(view) {
                return view.model === chainHead;
            }).index;

            this.chainHeadBeingFocused = true;

            var slideLeft = viewIndex > CHAIN_HEAD_MIDDLE;
            var $container = this.$('.ph-container');

            $container
                .addClass('ph-sliding')
                .css({ left: ((WIN_WIDTH * HOR_DOMINANCE + PADDING_PX) * (slideLeft ? -1 : 1)) + 'px' })
                .on('webkitTransitionEnd', function() {

                $container.removeClass('ph-sliding').css({ left: '0px' });

                _.each(that.chainHeadViews, function(view) {

                    if (slideLeft)
                        view.index = view.index === FIRST ? LAST : view.index - 1; // make the first view LAST
                    else
                        view.index = view.index === LAST ? FIRST : view.index + 1; // make the last view FIRST

                    view.$el.css({ left: that.getLeftForIndex(view.index) + 'px' });
                    view.isCurrentlyFocused = view.index === CHAIN_HEAD_MIDDLE;

                });

                _.find(that.chainHeadViews, function(view) {
                    return slideLeft ? view.index === FIRST : view.index === LAST;
                }).detachFromModel();

                _.find(that.chainHeadViews, function(view) {
                    return !slideLeft ? view.index === FIRST : view.index === LAST;
                }).prepareForModel(that.chainHeads.at(indexOf + (slideLeft ? 2 : -2)));

                _.find(that.chainHeadViews, function(view) {
                    return !slideLeft ? view.index === FIRST + 1 : view.index === LAST - 1;
                }).attachToModel(that.chainHeads.at(indexOf + (slideLeft ? 1 : -1)));

                $container.off('webkitTransitionEnd');

                that.chainHeadBeingFocused = false;

            });

        }

    });
    
    var NavView = phunt.views.base.extend({
    	
    	el: $('#ph-nav')[0],
    	
    	initialize: function() {
    		this.addFastButtons();
    	},

    	events : {
    		"fastclick #button-nav" : "toggleNav",
			"fastclick #button-create" : "createGame",
			"fastclick #button-refresh" : "refreshGames",
			"fastclick #button-settings" : "editSettings"
		},
		
		toggleNav: function() {
			this.$el.toggleClass('open');
		},
		
		createGame: function() {
            phunt.navigation.go('create');
		},
		
		refreshGames: function() {
			categoryCollectionView.refreshData();
		},
		
		editSettings: function() {
			phunt.navigation.go('settings');
		}    	
    });

    var CategoryCollectionView = phunt.views.base.extend({

        el: $('#ph-view-chains')[0],

        viewID: 'chains',

        initialize: function() {

            _.bindAll(this, 'addAll');

            this.collection.on('reset', this.addAll);

        },

        events: {
            back: function() {
                window.navigator.app.exitApp();
            },
            enter: function(event, location) {

                if (location) // if we were provided with a new location
                    this.location = location;

                if (!this.collection.length) // if not yet fetched...
                    this.refreshData();
                
                nav.$el.show();

            },
            
            leave: function() {
            	nav.$el.hide();
            },
            touchstart: function(event) {
                var e = event.originalEvent.touches[0];
                this.firstTouchAt = { x: e.screenX, y: e.screenY };
            },
            touchmove: function(event) {
                var e = event.originalEvent.touches[0];
                this.lastTouchAt = { x: e.screenX, y: e.screenY };
            },
            touchend: function(event) {

                if (!this.lastTouchAt)
                    return;

                var horDelta = this.lastTouchAt.x - this.firstTouchAt.x;
                var verDelta = this.lastTouchAt.y - this.firstTouchAt.y;
                var horGesture = Math.abs(horDelta) > Math.abs(verDelta);
                var direction = horGesture ? (horDelta > 0 ? 'right' : 'left') : (verDelta > 0 ? 'down' : 'up');

                this.navigateBySwipe(direction);

            }
        },

        navigateBySwipe: function(direction) {

            console.log('navigateBySwipe: ' + direction);

            function byBeingFocused(view) {
                return view.isCurrentlyFocused;
            }

            var currentCat = _.find(this.categoryViews, byBeingFocused);
            var currentCatIndex = _.indexOf(this.categoryViews, currentCat);

            if (direction === 'up')
                return this.focusCategory(this.categoryViews[currentCatIndex + 1]);
            else if (direction === 'down')
                return this.focusCategory(this.categoryViews[currentCatIndex - 1]);

            var catView = this.categoryViews[currentCatIndex];
            var currentChainHeadView = _.find(catView.chainHeadViews, byBeingFocused);
            var currentChainHeadIndex = _.indexOf(catView.chainHeads.models, currentChainHeadView.model);

            if (direction === 'left')
                catView.focusChainHeadAnimated(catView.chainHeads.models[currentChainHeadIndex + 1]);
            else if (direction === 'right')
                catView.focusChainHeadAnimated(catView.chainHeads.models[currentChainHeadIndex - 1]);

        },

        refreshData: function() {

            if (!this.location || !this.location.coords)
                return alert('Error: No location given to Chains view!');

            this.collection.url = API_ENDPOINT + '?uuid=' + phunt.main.getUUID() + '&lat=' + this.location.coords.latitude + '&lon=' + this.location.coords.longitude;
            this.collection.fetch();
            
            this.$el.html('<div class="ph-loading ph-title">Loading<span>...</span></div>');

        },

        addAll: function(collection) {

            var that = this;
            var $container = $('<div class="ph-container"></div>');

            this.categoryViews = [];
           
            this.$el.html('');

            collection.each(function(model, index) {
                var view = new CategoryView({
                    model: model,
                    index: index,
                    parentCategoryCollectionView: that
                });
                that.categoryViews.push(view);
                $container.append(view.el);
            });
            
            this.$el.append($container);

            this.focusCategory(this.categoryViews[0]);

        },

        focusCategory: function(categoryView) {

            if (!categoryView)
                return;

            var $container = this.$('> .ph-container');

            $container.css({
                top: -1 * (WIN_HEIGHT * VER_DOMINANCE * categoryView.index) + 'px'
            });

            _.each(this.categoryViews, function(view, index) {
                view.isCurrentlyFocused = index === categoryView.index;
            });

            console.log('Current CategoryView owns ChainHeads: ', _.map(categoryView.model.get('chainHeads').models, function(chainHead) {
                return chainHead.id;
            }));

        }

    });
    
    var categoryCollectionView = new CategoryCollectionView({ collection: new CategoryCollection() });
    
    phunt.views.register(categoryCollectionView);
    
    var nav = new NavView();

})();