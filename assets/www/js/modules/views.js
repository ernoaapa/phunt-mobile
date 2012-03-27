define(function() {

    "use strict";

    var _ = window._,
        Backbone = window.Backbone,
        MBP = window.MBP,
        registry = {},
        exports = {};

    exports.register = function(viewInstance) {

        registry[viewInstance.viewID] = viewInstance;

    };

    exports.get = function(viewID) {

        if (!registry.hasOwnProperty(viewID))
            throw new Error('No view with ID: ' + viewID);

        return registry[viewID];

    };

    exports.base = Backbone.View.extend({

        addFastButtons: function() {

            var EVENT_NAME = 'fastclick';
            var events = (_.isFunction(this.events) ? this.events() : this.events) || {};
            var that = this;

            function byEventName(key) {
                return key.substr(0, EVENT_NAME.length + 1) === EVENT_NAME + ' ' || key === EVENT_NAME;
            }

            function toJustSelectors(key) {
                return key.substr(EVENT_NAME.length + 1);
            }

            function toMatchingElements(selector) {
                return selector === "" ? [that.el] : that.$(selector).toArray();
            }

            function registerTrigger(element) {
                new MBP.fastButton(element, function() {
                    $(element).trigger(EVENT_NAME);
                });
            }

            _.chain(events).keys().filter(byEventName).map(toJustSelectors).map(toMatchingElements).flatten().each(registerTrigger);

        }

    });

    return exports;
});