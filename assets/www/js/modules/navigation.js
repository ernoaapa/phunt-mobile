define(["modules/views"], function(views) {

    "use strict";

    var currentView,
        exports = {};

    exports.back = function() {

        if (currentView)
            currentView.$el.trigger('back');

    };

    if (window.PhoneGap) {
        document.addEventListener('deviceready', function() {
            document.addEventListener('backbutton', exports.back, false);
        }, false);
    } else {
        $(document).on('backbutton', exports.back);
    }

    exports.go = function(viewID, extraParameters) {

        if (currentView) {

            currentView.$el.removeClass('ph-current');
            currentView.$el.trigger('leave');

        }

        currentView = views.get(viewID);

        if (!currentView.hasBeenPrepared) {

            currentView.hasBeenPrepared = true;
            currentView.addFastButtons();

        }

        window.scrollTop = 0;

        currentView.$el.trigger('enter', extraParameters);
        currentView.$el.addClass('ph-current');

    };

    return exports;
});