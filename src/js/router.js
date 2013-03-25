// Router
airvantagemap.types.Router = Backbone.Router.extend({
	routes: {
		"homeTab": "homeTab",
		"mapTab": "mapTab",
		"alertsTab": "alertsTab"
	},
	homeTab: function() {
		forge.is.mobile() && state.get('homeButton').setActive();
		forge.topbar.setTitle("AirVantage");
		state.get('home').show();
	},
	mapTab: function() {
		forge.is.mobile() && state.get('mapButton').setActive();
		forge.topbar.setTitle("Systems");
		state.get('map').show();
	},
	alertsTab: function() {
		forge.is.mobile() && state.get('alertsButton').setActive();
		forge.topbar.setTitle("Alerts");
		state.get('alerts').show();
	}
});
airvantagemap.router = new airvantagemap.types.Router();