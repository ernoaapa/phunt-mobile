phunt = window.phunt || {};

(function(exports) {

    "use strict";

    var Backbone = window.Backbone;
    var registry = {};

    exports.register = function(viewInstance) {

        registry[viewInstance.viewID] = viewInstance;

    };

    exports.get = function(viewID) {

        if (!registry.hasOwnProperty(viewID))
            throw new Error('No view with ID: ' + viewID);

        return registry[viewID];

    };

    exports.base = Backbone.View.extend({

        // TODO

    });

})(phunt.views = {});