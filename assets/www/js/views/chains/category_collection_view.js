define(["modules/views", "modules/config", "modules/util", "./category_view"], function(views, config, util, CategoryView) {

    var WIN_HEIGHT = config.win.height,
        VER_DOMINANCE = config.win.verDominance,
        API_ENDPOINT = config.api.CHAINHEADS_ENDPOINT;

    var CategoryCollectionView = views.base.extend({

        el: $('#ph-view-chains')[0],

        viewID: 'chains',

        initialize: function() {

            _.bindAll(this, 'addAll');

            this.collection.on('reset', this.addAll);

        },

        events: {
            back: function() {
                alert('Back button pressed');
                window.navigator.app.exitApp();
            },
            enter: function(event, location) {

                if (location) // if we were provided with a new location
                    this.location = location;

                if (!this.collection.length) // if not yet fetched...
                    this.refreshData();
                else
                    this.trigger('showNav');
            },

            leave: function() {
            	this.trigger('hideNav');
            },
            touchstart: function(event) {
                var e = event.originalEvent.touches[0];
                this.firstTouchAt = { x: e.screenX, y: e.screenY };
                event.preventDefault();
            },
            touchmove: function(event) {
                var e = event.originalEvent.touches[0];
                this.lastTouchAt = { x: e.screenX, y: e.screenY };
                event.preventDefault();
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

        getCurrentCatIndex: function() {
        	 function byBeingFocused(view) {
                 return view.isCurrentlyFocused;
             }
        	 var currentCat = _.find(this.categoryViews, byBeingFocused);
             return _.indexOf(this.categoryViews, currentCat);
        },

        getCenteredChainHeadIndex: function(catView) {
        	 function byBeingFocused(view) {
                 return view.isCurrentlyFocused;
             }
            var currentChainHeadView = _.find(catView.chainHeadViews, byBeingFocused);
            return _.indexOf(catView.chainHeads.models, currentChainHeadView.model);
        },

        navigateBySwipe: function(direction) {

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

            this.collection.url = API_ENDPOINT + '?uuid=' + util.getUUID() + '&lat=' + this.location.coords.latitude + '&lon=' + this.location.coords.longitude;
            this.collection.fetch();

            this.$el.html('<div class="ph-loading ph-title">Loading<span>...</span></div>');

        },

        addAll: function(collection) {

            var that = this;
            var $container = $('<div class="ph-container"></div>');

            this.categoryViews = [];

            this.$el.html('');
            this.trigger('showNav');

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

        focusFirstCategory: function() {
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

    return CategoryCollectionView;

});