(function() {

    var Backbone = window.Backbone;
    var HOR_DOMINANCE = 0.8;
    var VER_DOMINANCE = 0.6;
    var catCollView;

    var Location = Backbone.Model.extend({

    });

    var LocationCollection = Backbone.Collection.extend({

        model: Location

    });

    var Category = Backbone.Model.extend({

        initialize: function() {
            this.set({
                chainHeads: new LocationCollection(this.get('chainHeads'))
            });
        }

    });

    var CategoryCollection = Backbone.Collection.extend({

//        url: 'http://phuntter.herokuapp.com/api/v1/chains/heads?uuid=1&lat=1&lon=1',
        url: 'dummy-chains.json',

        model: Category

    });

    var CategoryView = phunt.views.base.extend({

        events: {
            'fastclick': 'focusThisCategory'
        },

        initialize: function(options) {

            this.index = options.index;

            this.addFastButtons();

            this.$el.addClass('ph-category');
            this.$el.text('categoryName: ' + this.model.get('categoryName'));
            this.$el.css({ // align this category to its proper place with its index
                width: window.innerWidth + 'px',
                height: (window.innerHeight * VER_DOMINANCE) + 'px',
                top: ((window.innerHeight * (1 - VER_DOMINANCE)) / 2 + (window.innerHeight * VER_DOMINANCE) * this.index) + 'px'
            });

            var embeddedCollection = this.model.get('chainHeads');

            this.initializeChainHeads();

        },

        initializeChainHeads: function() {

            // TODO

//            _.each(_.range(3), function(item) {
//                console.log(item);
//            });

        },

        focusThisCategory: function() {

            catCollView.focusCategory(this);

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
            enter: function() {
                var that = this;
                _.delay(function() {
                    that.collection.fetch();
                }, 1000);
            }
        },

        addAll: function(collection) {

            var $container = $('<div class="ph-container"></div>');

            this.$el.html('');

            collection.each(function(model, index) {
                $container.append(new CategoryView({
                    model: model,
                    index: index
                }).el);
            });

            this.$el.append($container);

        },

        focusCategory: function(categoryView) {

            var $container = this.$('.ph-container');

            $container.css({
                top: -1 * (window.innerHeight * VER_DOMINANCE * categoryView.index) + 'px'
            });

        }

    });

    catCollView = new CategoryCollectionView({
        collection: new CategoryCollection()
    });

    phunt.views.register(catCollView);

})();