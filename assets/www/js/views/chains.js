(function() {

    var Backbone = window.Backbone;
    var HOR_DOMINANCE = 0.7;
    var VER_DOMINANCE = 0.6;
    var CHAIN_HEAD_PLACEHOLDERS = 3;
    var API_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/chains/heads'; // 'dummy-chains.json'

    var ChainHead = Backbone.Model.extend({

    });

    var ChainHeadView = phunt.views.base.extend({

        className: 'ph-chainHead',

        events: {
            'fastclick': function() {
//                console.log(this.$el.width() + ' x ' + this.$el.height());
                if (this.parentCategoryView.isCurrentlyFocused && this.isCurrentlyFocused)
                    phunt.navigation.go('location', this.model.get('resourceUrl'));
                else if (this.parentCategoryView.isCurrentlyFocused)
                    this.parentCategoryView.focusChainHead(this.model);
                else
                    this.parentCategoryView.parentCategoryCollectionView.focusCategory(this.parentCategoryView);
            }
        },

        initialize: function(options) {

            this.index = options.index;
            this.parentCategoryView = options.parentCategoryView;
            this.$el.css({
                top: 0,
                bottom: 0,
                width: (window.innerWidth * HOR_DOMINANCE) + 'px',
                left: ((window.innerWidth * (1 - HOR_DOMINANCE)) / 2 + window.innerWidth * HOR_DOMINANCE * (this.index - 1)) + 'px'
            });
            
            console.log(options)
            
            this.$el.append($('<div class="ph-roughDistance"></div>'));
                        
            this.addFastButtons();

        },

        render: function() {
        	
            this.$el.css({
                'backgroundImage': this.model ? 'url("' + this.model.get('gridPictureUrl') + '")' : ''
            });
            
            if (this.model) {
            	this.$el.find('.ph-roughDistance').text(this.model.get('roughDistance')); 
            }

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
                width: window.innerWidth + 'px',
                height: (window.innerHeight * VER_DOMINANCE) + 'px',
                top: ((window.innerHeight * (1 - VER_DOMINANCE)) / 2 + (window.innerHeight * VER_DOMINANCE) * this.index) + 'px'
            });

            this.chainHeads = this.model.get('chainHeads');
            this.chainHeadViews = [];

            this.initializeChainHeads();
            this.focusChainHead(this.chainHeads.at(0));

        },

        initializeChainHeads: function() {

            var $container = $('<div class="ph-container"></div>');

            $container.css({
                top: '20px',
                left: 0,
                bottom: '20px',
                right: 0
            });

            var that = this;

            _.each(_.range(CHAIN_HEAD_PLACEHOLDERS), function(index) {

                var chainHeadView = new ChainHeadView({
                    model: that.chainHeads.at(index),
                    index: index,
                    parentCategoryView: that
                });

                that.chainHeadViews.push(chainHeadView);

                $container.append(chainHeadView.$el);

            });

            this.$el.append($container);

        },

        focusChainHead: function(chainHead) {

            var that = this;
            var indexOf = this.chainHeads.indexOf(chainHead);

            if (indexOf === -1)
                return; // can't focus nonexistant chainHead instance

            _.each(_.range(CHAIN_HEAD_PLACEHOLDERS), function(index) {
                var view = that.chainHeadViews[index];
                view.model = that.chainHeads.at(indexOf + index - 1); // Note: -1 is related to CHAIN_HEAD_PLACEHOLDERS
                view.isCurrentlyFocused = index === 1;
                view.render();
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
            }
        },

        refreshData: function() {

            if (!this.location || !this.location.coords)
                return alert('Error: No location given to Chains view!');

            this.collection.url = API_ENDPOINT + '?uuid=' + phunt.main.getUUID() + '&lat=' + this.location.coords.latitude + '&lon=' + this.location.coords.longitude;
            this.collection.fetch();
            
            this.$el.html('<div class="ph-loading">Loading...</div>');

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

            var $container = this.$('> .ph-container');

            $container.css({
                top: -1 * (window.innerHeight * VER_DOMINANCE * categoryView.index) + 'px'
            });

            _.each(this.categoryViews, function(view, index) {
                view.isCurrentlyFocused = index === categoryView.index;
            });

        }

    });
    
    var categoryCollectionView = new CategoryCollectionView({ collection: new CategoryCollection() });
    
    phunt.views.register(categoryCollectionView);
    
    var nav = new NavView();

})();