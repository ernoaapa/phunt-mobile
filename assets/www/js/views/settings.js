(function() {

    var API_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/settings';

    var SettingsView = phunt.views.base.extend({

        el: $('#ph-view-settings')[0],

        viewID: 'settings',

        events: {
        	'fastclick #ph-save-settings': 'save',
        	back: function() {
        		if (!this.waitingForLocation)
        			phunt.navigation.go('chains');
            },
            
            enter: function() {
            	this.fetchName();
            }
        },

        initialize: function() {
        },
        
        fetchName: function() {
        	var that = this;
        	$.ajax({
                url: API_ENDPOINT + "?uuid=" + phunt.main.getUUID(),
                type: 'GET',
                success: function(data) {
                	that.$('#ph-name-input').val(data.name);
                }
            });
        },
        
        save: function() {

        	var that = this;

            if (this.waitingForLocation)
                return;

            this.waitingForLocation = true;        	
        	
        	this.$('#ph-save-settings').text('Saving...');
        	
            $.ajax({
                url: API_ENDPOINT,
                type: 'POST',
                dataType: 'text',
                data: {
                    uuid: phunt.main.getUUID(),
                    username: that.$('#ph-name-input').val()
                },
                success: saveSuccess,
                error: saveError
            });
            
            function saveSuccess()  {
            	that.$('#ph-save-settings').text('Save');
            	that.waitingForLocation = false;
            }
            
            function saveError() {            	
            }
        }
    });

    phunt.views.register(new SettingsView());

})();