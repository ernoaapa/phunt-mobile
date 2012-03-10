phunt = window.phunt || {};


(function(exports) {

    "use strict";

    if (!window.PhoneGap)
        return; // we're likely running within a desktop browser

    var PhoneGap = window.PhoneGap;
    var PluginManager = window.PluginManager;
    var PicUploader = function() {

    }

	/**
	 * Given a content:// uri, uploads the file to the server as a multipart/mime request
	 *
	 * @param server URL of the server that will receive the file
	 * @param fileUri content:// uri of the file to upload
	 * @param uploadUrl Where to upload the file
	 * @param uuid phone id
	 * @param chainId 
	 * @param lat
	 * @param lon
	 * @param callback Success callback. Also receives progress messages during upload.
	 * @param fail Error callback
	 */
	PicUploader.prototype.upload = function(options, callback, fail) {

	    return PhoneGap.exec(function(args) {
	        callback(args);
	    }, function(args) {
			if(typeof fail == 'function') {
		        fail(args);
			}
	    }, 'PicUploader', 'upload', [ options ]);
	};

	PicUploader.Status = {
		PROGRESS: "PROGRESS",
		COMPLETE: "COMPLETE"
	}

	PhoneGap.addConstructor(function() {
		PhoneGap.addPlugin('picUploader', new PicUploader());
		PluginManager.addService("PicUploader","com.phunt.plugin.PicUploadPlugin");
    });
    
    exports.picUploader = new PicUploader();

})(phunt);
