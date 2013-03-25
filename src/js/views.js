// Views

airvantagemap.views.Home = Backbone.View.extend({
	tagName: "div",
	id: "home",
	render: function() {
		var el = this.el;
		forge.logging.log('Start render home ...');
		if (airvantagemap.user){
			forge.logging.log('logged');
			forge.tools.getURL('img/login.png', function(src) {
				$(el).html(Mustache.render($('#tmpl-logged').text(), {
					user: airvantagemap.user.name,
					logoutIcon: src
				}));
				forge.logging.log('bind function logout');
				$('#logged', el).bind(clickEvent, function() {
					forge.logging.log('... logout');
					//TODO
				});
				fake_active($('#logged', el));
			});
		} else {
			forge.logging.log('not logged');
			forge.tools.getURL('img/login.png', function(src) {
				$(el).html(Mustache.render($('#tmpl-notlogged').text(), {
					loginIcon: src
				}));
				forge.logging.log('bind function login');
				$('#notlogged', el).bind(clickEvent, function() {
					forge.logging.log('... login');
					airvantagemap.login();
				});
				fake_active($('#notlogged', el));
			});
		}
		forge.logging.log('... complete render home.');
		return this;
	},
	refresh: function() {
		$('#home').remove();
		this.render();
		$('#home_container').append(this.el);
	},
	close: function() {
		$('#home_container').hide();
		$('#home').remove();
		this.remove();
	},
	show: function () {
		forge.logging.log('Start show home ...');
		airvantagemap.resetCurrentView(this);
		$('#home_container').show();
		$('#home_container').append(this.el);
		forge.logging.log('... complete show home.');
	}
});

airvantagemap.views.Alerts = Backbone.View.extend({
	tagName: "div",
	id: "alerts",
	render: function() {
		var el = this.el;
		$('#alerts_container').append(el);
		return this;
	},
	initList: function() {
		forge.logging.log('... Initializing alert list');
		forge.request.ajax({
			url: airvantagemap.url+'/v1/alerts?fields=uid,date,rule,target&access_token='+airvantagemap.token,
			dataType: 'json',
			success: function (data) {
				forge.logging.log('Alerts '+data.items);
				data.items.forEach(function(item) {
					forge.logging.log('Alert '+item.rule.name);
					state.get('alerts').add(item);
				})
			},
			error: function (error) {
				alert("Error");
			}
		});
		forge.geolocation.getCurrentPosition(function(position) {
			$(this.el).empty();
			state.set('currentCoords', position.coords);
			forge.logging.log('Set current position:');
			forge.logging.log(position.coords);
			var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude, true);
			var myOptions = {
				zoom: 13,
				center: latLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			forge.logging.log('... Create list');
			state.get('map').gmap = new google.maps.Map(document.getElementById('map'), myOptions);
			forge.logging.log('Created alert list...');			
		});
		// TODO
		return this;
	},
	add: function(alert) {
		var el = this.el;
		forge.logging.log('Adding photo to list');
		$(el).prepend(Mustache.render($('#tmpl-list').text(), photo.toJSON()));
		this.display($('.ratephoto', el).first());
		state.get('map').add(photo);
	},
	close: function() {
		$('#alerts_container').hide();
		$('#alerts').hide();
	},
	show: function () {
		airvantagemap.resetCurrentView(this);
		$('#alerts_container').show();
		$('#alerts').show();
	}
});

airvantagemap.views.Map = Backbone.View.extend({
	tagName: "div",
	id: "map",
	gmap: null,
	toAdd: [],
	render: function() {
		var el = this.el;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyDulCMdnEFQPpRS6xity3Z4khkUWStW0Ng&sensor=true&callback=airvantagemap.initMap";
		document.body.appendChild(script);
		$('#map_container').append(el);
		return this;
	},
	initMap: function() {
		forge.logging.log('... Initializing map');
		forge.geolocation.getCurrentPosition(function(position) {
			$(this.el).empty();
			state.set('currentCoords', position.coords);
			forge.logging.log('Set current position:');
			forge.logging.log(position.coords);
			var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude, true);
			var myOptions = {
				zoom: 13,
				center: latLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			forge.logging.log('... Create map');
			state.get('map').gmap = new google.maps.Map(document.getElementById('map'), myOptions);
			forge.logging.log('Created map ...');			
		});
	},
	add: function(item) {
		if (state.get('map').gmap) {
			forge.logging.log('Adding item to map');
			var latLng = new google.maps.LatLng(item.latitude, item.longitude, true);
			forge.tools.getURL('img/marker-ready.png', function(src) {
				var marker = new google.maps.Marker({
					position: latLng,
					map: state.get('map').gmap,
					icon: src,
					zIndex: 1
				});
			
				google.maps.event.addListener(marker, 'click', function() {
					//airvantagemap.router.navigate('detail/'+idx, { trigger: true });
					//$('#map_container').hide();
					alert("Click on item");
				});
			});
		} else {
			forge.logging.log('Map not ready, waiting to add item');
		}
	},
	show: function(idx) {
		$('#map_container').show();
		airvantagemap.resetCurrentView(this);
		if (state.get('map').gmap) {
			google.maps.event.trigger(state.get('map').gmap, 'resize');
			var currentLatLng = new google.maps.LatLng(state.get('currentCoords').latitude, state.get('currentCoords').longitude, true);
			state.get('map').gmap.setCenter(currentLatLng);

			var latLngBounds = state.get('map').gmap.getBounds();
			forge.logging.log('Map bounds='+latLngBounds);
			forge.request.ajax({
				url: airvantagemap.url+'/v1/widgets/systems/monitor/location?swLatitude='+latLngBounds.getSouthWest().lat()+'&swLongitude='+latLngBounds.getSouthWest().lng()+'&neLatitude='+latLngBounds.getNorthEast().lat()+'&neLongitude='+latLngBounds.getNorthEast().lng()+'&offset=0&size=10&access_token='+airvantagemap.token,
				dataType: 'json',
				success: function (data) {
					forge.logging.log('Items '+data.items);
					data.items.forEach(function(item) {
						forge.logging.log('Item '+item.name);
						state.get('map').add(item);
					})
				},
				error: function (error) {
					alert("Error");
				}
			});
		} else {
			this.initMap();
			$('#map').html('<div class="title">Loading...</div>');
		}
	},
	close: function() {
		$('#map_container').hide();
	}
});