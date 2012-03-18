phunt.views = phunt.views || {};

(function(views, config) {

    var Backbone = window.Backbone;
    var WIN_WIDTH = config.win.width;
    var WIN_HEIGHT =  config.win.height;
    var HOR_DOMINANCE = config.win.horDominance;
    var VER_DOMINANCE = config.win.verDominance;
    var PADDING_PX = config.win.paddingPx;

    var CHAIN_HEAD_PLACEHOLDERS = 5;
    var CHAIN_HEAD_MIDDLE = 2;
    var FIRST = 0;
    var LAST = CHAIN_HEAD_PLACEHOLDERS - 1;

   
    var CategoryView = Backbone.View.extend({

        initialize: function(options) {

            this.index = options.index;
            this.parentCategoryCollectionView = options.parentCategoryCollectionView;

            _.bindAll(this, 'handleAddedChainHead');

            this.$el.addClass('ph-category');
            this.$el.css({ // align this category to its proper place with its index
                width: WIN_WIDTH + 'px',
                height: (WIN_HEIGHT * VER_DOMINANCE) + 'px',
                top: ((WIN_HEIGHT * (1 - VER_DOMINANCE)) / 2 + (WIN_HEIGHT * VER_DOMINANCE) * this.index) + 'px'
            });

            this.chainHeads = this.model.get('chainHeads');
            this.chainHeadViews = [];

            this.initializeChainHeads();

            // TODO: this is a memory leak on data refresh
            this.chainHeads.on('add', this.handleAddedChainHead);
        },

        handleAddedChainHead: function(chainHead) {
            // See if recently added model should be displayed

            var indexOfAddedModel = this.chainHeads.indexOf(chainHead);

            var indexOfFocusedModel = this.chainHeads.indexOf(this.focusedChainHead);

            var diff = Math.abs(indexOfAddedModel - indexOfFocusedModel);

            if (diff > 1) {
                // Model is far away so we don't need to setup ChainHeadView stuff
                return;
            }

            console.log("loopy");

            _.each(this.chainHeadViews, function(view) {
               if (view.index == LAST-1) {
                   view.attachToModel(chainHead);
               }
            });

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
                var chainHeadView = new views.ChainHeadView({
                    index: index,
                    parentCategoryView: that
                });

                that.chainHeadViews.push(chainHeadView);

                $container.append(chainHeadView.$el);

                if (index > FIRST && index < LAST)
                    chainHeadView.attachToModel(correspondingModel);

                if (index === FIRST || index === LAST)
                    chainHeadView.prepareForModel(correspondingModel);

                if (index == CHAIN_HEAD_MIDDLE) {
                    chainHeadView.isCurrentlyFocused = true;
                    that.focusedChainHead = correspondingModel;
                }

            });

            this.$el.append($container);

        },

        getLeftForIndex: function(index) {
            var left =   (WIN_WIDTH * (1 - HOR_DOMINANCE)) / 2
                        + WIN_WIDTH * HOR_DOMINANCE * (index - CHAIN_HEAD_MIDDLE)
                        + (index - CHAIN_HEAD_MIDDLE) * PADDING_PX;

            return Math.round(left);
        },

        travel: function(chainHead) {
            var that = this;
            var destinationIndex = this.chainHeads.indexOf(chainHead);

            if (destinationIndex === -1)
                return; // can't focus nonexistant chainHead instance

            var indexOfFocusedModel = this.chainHeads.indexOf(this.focusedChainHead);

            console.log("Starting travel from "+indexOfFocusedModel+" to "+destinationIndex);

            var increment = indexOfFocusedModel > destinationIndex ? -1 : 1;

            var nextIndex = indexOfFocusedModel + increment;

            this.on("focusComplete", function() {
            	if (nextIndex != destinationIndex) {
                    nextIndex += increment;
                    console.log("Traveling to "+ nextIndex);

                    that.focusChainHeadAnimated(this.chainHeads.at(nextIndex));
                } else {
                    console.log("Traveling complete.");
                    that.off("focusComplete");
                    _.defer(function() {
                       that.trigger("travelComplete");
                    });
                }
            });

            console.log("Traveling to " + nextIndex);
            this.focusChainHeadAnimated(this.chainHeads.at(nextIndex));
        },

        focusChainHeadAnimated: function(chainHead) {

            var that = this;
            var indexOfModel = this.chainHeads.indexOf(chainHead);

            console.log("focusChainHeadAnimated("+indexOfModel+")");

            if (indexOfModel === -1)
                return; // can't focus nonexistant chainHead instance

            if (this.chainHeadBeingFocused) {
                console.log("Still being focused. Interrupting focus request.");
                return;
            }

            var viewIndex = _.find(this.chainHeadViews, function(view) {
                return view.model === chainHead;
            }).index;

            this.chainHeadBeingFocused = true;

            var slideLeft = viewIndex > CHAIN_HEAD_MIDDLE;
            var $container = this.$('.ph-container');


            console.log("Starting slide animation");

            $container
                .addClass('ph-sliding')
                .css({ left: ((WIN_WIDTH * HOR_DOMINANCE + PADDING_PX) * (slideLeft ? -1 : 1)) + 'px' })
                .on('webkitTransitionEnd', function() {

                console.log("Sliding done");
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
                }).prepareForModel(that.chainHeads.at(indexOfModel + (slideLeft ? 2 : -2)));

                _.find(that.chainHeadViews, function(view) {
                    return !slideLeft ? view.index === FIRST + 1 : view.index === LAST - 1;
                }).attachToModel(that.chainHeads.at(indexOfModel + (slideLeft ? 1 : -1)));

                $container.off('webkitTransitionEnd');

                that.chainHeadBeingFocused = false;
                that.focusedChainHead = chainHead;

                _.defer(function() {
                    that.trigger("focusComplete");
                });
            });

        }

    });

    views.CategoryView = CategoryView;

})(phunt.views, phunt.config);