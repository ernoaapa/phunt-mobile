(function() {

    var API_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/settings';

    var Location = Backbone.Model.extend({

        // TODO

    });

    var SettingsView = phunt.views.base.extend({

        el: $('#ph-view-settings')[0],

        viewID: 'settings',

        events: {
        	'fastclick #ph-save-settings': 'save',
        	'fastclick #ph-cancel-settings': 'cancel'
        },

        initialize: function() {
        	this.fetchName();
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
            }
            
            function saveError() {            	
            }
        },
            
        
        cancel: function() {
        	phunt.navigation.go('chains');
        }

    });

    phunt.views.register(new SettingsView());

})();