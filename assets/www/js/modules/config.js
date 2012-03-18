phunt = window.phunt || {};

(function(exports) {

    "use strict";

    var baseApiUrl = 'http://iknowwhere.net/api/v1/';

    var api = exports.api = {};

    api.CHAINHEADS_ENDPOINT = endpoint('chains/heads'); // 'dummy-chains.json'
    api.POST_CHAINCREATE_ENDPOINT = endpoint('chains/create');
    api.POST_CHAINUPDATE_ENDPOINT = endpoint('chains/update');
    
    function endpoint(path) {
    	return baseApiUrl + path;
    }

    var win = exports.win = {};

    win.width = 480;
    win.height = 762;
    win.horDominance = 0.7;
    win.verDominance = 0.6;
    win.paddingPx = 20;

})(phunt.config = {});