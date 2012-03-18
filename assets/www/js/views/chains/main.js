(function(views, models) {
    var categoryCollectionView = new views.CategoryCollectionView({ collection: new models.CategoryCollection() });
    
    views.register(categoryCollectionView);
    
    var nav = new views.NavView();

    console.log(nav.el);
})(phunt.views, phunt.models);