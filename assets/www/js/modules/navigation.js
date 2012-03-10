phunt = window.phunt || {};

(function(exports) {

    "use strict";

    var currentView;

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

    exports.go = function(viewID) {

        if (currentView) {

            currentView.$el.removeClass('ph-current');
            currentView.$el.trigger('leave');

        }

        currentView = phunt.views.get(viewID);

        if (!currentView.hasBeenPrepared) {

            currentView.hasBeenPrepared = true;
            currentView.addFastButtons();

        }

        currentView.$el.addClass('ph-current');
        currentView.$el.trigger('enter');

    };

})(phunt.navigation = {});