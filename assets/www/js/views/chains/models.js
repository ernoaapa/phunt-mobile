
define(["modules/config"], function(config) {
   var Backbone = window.Backbone,
       API_ENDPOINT = config.api.CHAINHEADS_ENDPOINT,
       exports = {};

   exports.ChainHead = Backbone.Model.extend();

   exports.ChainHeadCollection = Backbone.Collection.extend({

       model: exports.ChainHead

   });

   exports.Category = Backbone.Model.extend({

       initialize: function() {
           this.set({ // turn the attribute into a Collection
               chainHeads: new exports.ChainHeadCollection(this.get('chainHeads'))
           });
       }

   });

   exports.CategoryCollection = Backbone.Collection.extend({

       url: API_ENDPOINT,

       model: exports.Category

   });

   return exports;
});