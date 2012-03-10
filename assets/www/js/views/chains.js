(function() {

    var Backbone = window.Backbone;
    var HOR_DOMINANCE = 0.8;
    var VER_DOMINANCE = 0.6;
    var CHAIN_HEAD_PLACEHOLDERS = 3;

    var ChainHead = Backbone.Model.extend({

    });

    var ChainHeadView = phunt.views.base.extend({

        className: 'ph-chainHead',

        events: {
            'fastclick': function() {
                if (this.parentCategoryView.isCurrentlyFocused)
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

            this.addFastButtons();

        },

        render: function() {

            if (this.model)
                this.$el.text(this.model.get('pictureUrl'));
            else
                this.$el.text('');

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

//        url: 'http://phuntter.herokuapp.com/api/v1/chains/heads?uuid=1&lat=1&lon=1',
        url: 'dummy-chains.json',

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
                top: 0,
                left: 0,
                bottom: 0,
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
                view.render();
            });

        }

    });

    var CategoryCollectionView = phunt.views.base.extend({

        el: $('#ph-view-chains')[0],

        viewID: 'chains',

        initialize: function() {

            _.bindAll(this, 'addAll');

            this.collection.on('reset', this.addAll);

            this.categoryViews = [];

        },

        events: {
            back: function() {
                window.navigator.app.exitApp();
            },
            enter: function() {
                var that = this;
                _.delay(function() { // TODO: Remove this, if we figure out when to safely use window.inner(Width|Height)
                    that.collection.fetch();
                }, 1000);
            }
        },

        addAll: function(collection) {

            var that = this;
            var $container = $('<div class="ph-container"></div>');

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

    phunt.views.register(new CategoryCollectionView({
        collection: new CategoryCollection()
    }));

})();