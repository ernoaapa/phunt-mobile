

require([
    "views/chains/nav_view",
    "views/chains/category_collection_view",
    "views/chains/models",
    "views/countdown",
    "views/location",
    "views/settings",
    "views/welcome",

    "modules/views",
    "modules/navigation"], function(NavView, CategoryCollectionView, chainModels, CountdownView, LocationView, SettingsView, WelcomeView, views, navigation) {

    // TODO: passing views their element would be 10x better than letting them fetch it from the dom themselves.

    views.register(new CategoryCollectionView({ collection: new chainModels.CategoryCollection() }));    
    views.register(new SettingsView());
    views.register(new LocationView());
    views.register(new SettingsView());
    views.register(new WelcomeView());

    new NavView();
    
    navigation.go('welcome');
});