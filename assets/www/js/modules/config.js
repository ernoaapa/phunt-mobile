
define(function() {

    "use strict";

    var baseApiUrl = 'http://iknowwhere.net/api/v1/';

    var api = {};

    api.CHAINHEADS_ENDPOINT = endpoint('chains/heads'); // 'dummy-chains.json'
    api.POST_CHAINCREATE_ENDPOINT = endpoint('chains/create');
    api.POST_CHAINUPDATE_ENDPOINT = endpoint('chains/update');
    api.VERIFY_LOCATION_ENDPOINT = endpoint('locations/verify');
    api.COMMENT_LOCATION_ENDPOINT = endpoint('comments/create');
    api.SETTINGS_ENDPOINT= endpoint('settings');

    function endpoint(path) {
    	return baseApiUrl + path;
    }

    var win = {};

    win.width = 480;
    win.height = 762;
    win.horDominance = 0.7;
    win.verDominance = 0.6;
    win.paddingPx = 20;

    return {
        "api" : api,
        "win" : win
    }
});