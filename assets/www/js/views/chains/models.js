phunt = window.phunt || {};
phunt.models = phunt.models || {};

(function(api, models) {
   //var API_ENDPOINT = 'dummy-chains.json';
   var API_ENDPOINT = api.CHAINHEADS_ENDPOINT;

   models.ChainHead = Backbone.Model.extend();

   models.ChainHeadCollection = Backbone.Collection.extend({

       model: models.ChainHead

   });

   models.Category = Backbone.Model.extend({

       initialize: function() {
           this.set({ // turn the attribute into a Collection
               chainHeads: new models.ChainHeadCollection(this.get('chainHeads'))
           });
       }

   });

   models.CategoryCollection = Backbone.Collection.extend({

       url: API_ENDPOINT,

       model: models.Category

   });

})(phunt.config.api, phunt.models);