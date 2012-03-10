phunt = window.phunt || {};


(function(exports) {

    "use strict";

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
	PicUploader.prototype.upload = function(fileUri, uploadUrl, uuid, chainid, lat, lon, callback, fail) {

	    return PhoneGap.exec(function(args) {
	        callback(args);
	    }, function(args) {
			if(typeof fail == 'function') {
		        fail(args);
			}
	    }, 'PicUploader', 'upload', [fileUri, uploadUrl, uuid, chainid, lat, lon]);
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
