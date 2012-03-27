
define(["./config", "./location", "./util"], function(config, location, util) {
    "use strict";

    var _ = window._,
        plugins = window.plugins,
        navigator = window.navigator,
        Camera = window.Camera,
        api = config.api,
        that = this;

    function takePicture(uploadParams, callbacks) {
    	
        if (this.imageBeingSubmitted)
            return;
        
    	var callbacks = $.extend({
    		cameraSuccess: logCall('cameraSuccess'),
    		cameraError: logCall('cameraError'),
    		locationError: logCall('locationError'),
    		uploadProgress: logCall('uploadProgress'),
    		uploadCompleting: logCall('uploadCompleting'),
    		uploadComplete: logCall('uploadComplete'),
    		uploadError: logCall('uploadError')
    	}, callbacks);
    	
    	function logCall(funcName) {
    		return function() {
	    	    console.log(funcName + " called.");
    		}
    	}
    	
        var fileToUpload;
        var alreadyCompleting;	

        if (typeof(Camera) === 'undefined') {
            console.log("Camera was undefined. Doing mock upload.");
            doMockCameraUpload(callbacks);
            return;
        }
        
        navigator.camera.getPicture(cameraSuccess, cameraError, {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA
        });

        function cameraSuccess(imageFileLocation) {
            that.imageBeingSubmitted = true;
            fileToUpload = imageFileLocation;
            callbacks.cameraSuccess();
            location.get(locationSuccess, locationError);
        }

        function cameraError() {
            // This can also just mean the user just pressed the Cancel-button
        	callbacks.cameraError();
        }

        function locationSuccess(position) {
            var params = {
                uuid: util.getUUID(),
                category: uploadParams.category,
                chainId: uploadParams.chainId,
                lat: position.coords.latitude,
                lon: position.coords.longitude                	
            };
            
            plugins.fileUploader.uploadByUri(api.POST_CHAINCREATE_ENDPOINT, fileToUpload, params, "image", "location.jpg", "image/jpg", uploadSuccess, uploadError);
        }

        function locationError() {
            that.imageBeingSubmitted = false;
        }

        function uploadSuccess(result) {
        	
            if (result.status == "PROGRESS") {

            	var percent = Math.round(result.progress * 100 / result.total);
            	
            	if (alreadyCompleting) {
            		return;
            	}
            	
            	alreadyCompleting = percent > 93;

            	if (!alreadyCompleting) {
            		callbacks.uploadProgress(percent);
            		
            	} else {
            		callbacks.uploadCompleting();
            	}
            	

            } else if (result.status == "COMPLETE") {
            	callbacks.uploadComplete(result.result);

            }

        }

        function uploadError(error) {
        	that.imageBeingSubmitted = false;
            callbacks.uploadError(error);

        }


        /** For testing in browser */
        function doMockCameraUpload(callbacks) {
            setTimeout(function() {
                callbacks.cameraSuccess();
            }, 1000);

            setTimeout(function() {
                callbacks.uploadProgress(50);
            }, 5000);

            setTimeout(function() {
                callbacks.uploadProgress(75);
            }, 6000);


            setTimeout(function() {
                callbacks.uploadCompleting();
            }, 7000);

            setTimeout(function() {
               callbacks.uploadComplete('http://iknowwhere.net/api/v1/locations/9');
            }, 10000);
        }
    }

    return {
        "takePicture" : takePicture
    }
});