

(function(views, models, camupload, navigation) {

    var NavView = views.base.extend({

     	el: $('#ph-nav')[0],

     	initialize: function() {
     		this.addFastButtons();
             _.bindAll(this);

            this.categoryCollectionView = views.get('chains');

            this.categoryCollectionView.on('showNav', this.show);
            this.categoryCollectionView.on('hideNav', this.hide);
     	},

     	events : {
     		"fastclick #button-nav" : "toggleNav",
 			"fastclick #button-create" : "createChain",
 			"fastclick #button-refresh" : "refreshChains",
 			"fastclick #button-settings" : "editSettings"
 		},

        show: function() {
            console.log(this.el);
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },

 		toggleNav: function() {
 			this.$el.toggleClass('open');
 		},

 		createChain: function() {
            var categoryView =  this.categoryCollectionView.categoryViews[0];
 			var chainHeadViews = categoryView.chainHeadViews;

     	    var loadingHeadModelData = { category: 'FAST', lon: 1, lat: 1, roughDistance: 'Uploading..', gridPictureUrl: 'img/loading.gif' }
 			var loadingHeadModel = new models.ChainHead(loadingHeadModelData);

            var that = this;

            camupload.takePicture({category: "FAST"}, {
             	cameraSuccess: function() {
             		that.categoryCollectionView.focusFirstCategory();
         			that.categoryCollectionView.collection.at(0).get('chainHeads').add(loadingHeadModel);

                    categoryView.on('travelComplete', function() {
                        categoryView.off('travelComplete');
                    });

                    categoryView.travel(loadingHeadModel);
             	},

             	uploadProgress: function(perc) {
                    loadingHeadModel.set("roughDistance", "Uploaded "+perc+"%");
             	},

                 uploadCompleting: function() {
                    loadingHeadModel.set("roughDistance", "Finishing up..");
                 },

             	uploadComplete : function(locationUri) {
                    loadingHeadModel.set("roughDistance", "Fetching data..");

             		var queryParams = '?uuid=' + phunt.main.getUUID() + '&lat=' + that.categoryCollectionView.location.coords.latitude + '&lon=' + that.categoryCollectionView.location.coords.longitude;

             		$.getJSON(locationUri+queryParams, function(data) {
                        data.roughDistance = "Your location";
             			loadingHeadModel.set(data);
             		});
             	}
             });

             _.defer(this.toggleNav);
 		},

 		refreshChains: function() {
 			this.categoryCollectionView.refreshData();
             _.defer(this.toggleNav);
 		},

 		editSettings: function() {

 			navigation.go('settings');
             _.defer(this.toggleNav);
 		}
     });

    views.NavView = NavView;

})(phunt.views, phunt.models, phunt.camupload, phunt.navigation);