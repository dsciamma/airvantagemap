//Fake support of :active on Android
var fake_active = function(el) {
	if (forge.is.android() && $(el).hasClass('listenactive')) {
		$(el).bind("touchstart", function () {
			$(this).addClass("active");
		}).bind("touchend", function() {
			$(this).removeClass("active");
		});
	}
}

// Setup "sensible" click/touch handling
var clickEvent = 'ontouchend' in document.documentElement ? 'tap' : 'click';

if (clickEvent == 'tap') {
	var currentTap = true;
	$('*').live('touchstart', function (e) {
		currentTap = true;
		e.stopPropagation();
	});
	$('*').live('touchmove', function (e) {
		currentTap = false;
	});
	$('*').live('touchend', function (e) {
		if (currentTap) {
			$(e.currentTarget).trigger('tap');
		}
		e.stopPropagation();
	});
}

// Organisation object
var airvantagemap = {
	types: {},
	views: {},
	models: {},
	collections: {},
	url: null,
	router: null,
	token: null,
	user: null,
	initialize: function() {
		forge.logging.log('Initializing...');
		airvantagemap.url = "https://na.m2mop.net/api";
		airvantagemap.initToken(function() {
			state.set('home', new airvantagemap.views.Home());
			state.get('home').render();
			forge.logging.log('Pre-rendered home');
			state.set('map', new airvantagemap.views.Map());
			state.get('map').render();
			forge.logging.log('Pre-rendered map');
			state.set('alerts', new airvantagemap.views.Alerts());
			state.get('alerts').render();
			forge.logging.log('Pre-rendered alerts');
		});
		Backbone.history.start();
		if (state.get('homeButton')) {
			airvantagemap.router.navigate("homeTab", { trigger: true});
			forge.logging.log('... completed initialization immediately');
		} else {
			window.initInterval = setInterval(function() {
				if (state.get('homeButton')) {
					airvantagemap.router.navigate("homeTab", { trigger: true});
					forge.logging.log('... completed initialization after delay');
					clearInterval(window.initInterval);
				} 
				}, 200);
		}
	},
	initToken: function(cb) {
		forge.prefs.get('token', function(token) {
			if (token) {
				forge.logging.log('Token: '+token);
				airvantagemap.token = token;
				airvantagemap.initUser();
			}
			cb();
		});
	},
	initUser: function() {
		forge.request.ajax({
			url: airvantagemap.url+'/v1/users/current?access_token='+airvantagemap.token,
			dataType: 'json',
			success: function (data) {
				if (data.error) {
					forge.logging.error(data.error);
					airvantagemap.token = null;
					forge.prefs.set('token', null);
				} else {
					airvantagemap.user = data;
				}
			},
			error: function (error) {
				forge.logging.error('Unable to get user details');
				forge.logging.error(error);
				airvantagemap.token = null;
				forge.prefs.set('token', null);
			}
		});
	},
	login: function() {
		forge.logging.log("Login...");
		forge.logging.log(airvantagemap.url+'/oauth/authorize?response_type=code&client_id=19b8c8c70e804123b84fb6ad8fc8fcd3&redirect_uri=https%3A%2F%2Ftrigger.io%2Foauth2callback');
		forge.tabs.openWithOptions({
			url: airvantagemap.url+'/oauth/authorize?response_type=code&client_id=19b8c8c70e804123b84fb6ad8fc8fcd3&redirect_uri=https%3A%2F%2Ftrigger.io%2Foauth2callback',
			pattern: 'https://trigger.io/oauth2callback*'
		}, function (data) {
			forge.logging.log("URL="+data.url);
			// First, parse the query string
			var params = {}, queryString = data.url.substring(data.url.indexOf('?')+1),
			    regex = /([^&=]+)=([^&]*)/g, m;
			forge.logging.log("queryString="+queryString);
			while (m = regex.exec(queryString)) {
				params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}
			var code = params['code'];
			if (code) {
				forge.logging.log("Code="+code);
				forge.logging.log(airvantagemap.url+'/oauth/token?grant_type=authorization_code&code='+code+'&client_id=19b8c8c70e804123b84fb6ad8fc8fcd3&client_secret=e48807b4982a450eadcfcbaac1d108b0');
				forge.request.ajax({
					url: airvantagemap.url+'/oauth/token?grant_type=authorization_code&code='+code+'&client_id=19b8c8c70e804123b84fb6ad8fc8fcd3&client_secret=e48807b4982a450eadcfcbaac1d108b0',
					dataType: 'json',
					success: function (data) {
						if (data.error) {
							forge.logging.error(data.error);
							airvantagemap.token = null;
							forge.prefs.set('token', null);
						} else {
							airvantagemap.token = data.access_token;
							forge.logging.log("Token="+airvantagemap.token);
							forge.prefs.set('token', airvantagemap.token);

							airvantagemap.initUser();
						}
						state.get('home').refresh();
					},
					error: function (error) {
						alert("Error");
					}
				});	
			}
		}, function (data) {
			forge.logging.log("Error open with options");
		});
	},
	logout: function() {
		forge.logging.log("Logout...");
		forge.request.ajax({
			url: airvantagemap.url='/oauth/expire?access_token='+airvantagemap.token,
			dataType: 'json',
			success: function (data) {
				airvantagemap.token = null;
				forge.prefs.set('token', airvantagemap.token);
				airvantagemap.user = null;
				state.get('home').refresh();
			},
			error: function (error) {
				alert("Error");
			}
		});
	},
	initMap: function() {
		forge.logging.log('Google Maps API loaded');
		state.get('map').initMap();
	},
	resetCurrentView: function(view) {
		forge.topbar.removeButtons();
		if (state.get('currentView')) {
			state.get('currentView').close();
		}
		state.set('currentView', view);
	}
};
