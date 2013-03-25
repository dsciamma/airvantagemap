var state = new airvantagemap.models.State();

forge.topbar.show();
forge.topbar.setTitle('AirVantage');

//Style top bar and tab bar
forge.topbar.setTint([88,22,43,255]);
forge.tabbar.setActiveTint([88,22,43,255]);


forge.tabbar.addButton({
	text: "Home",
	icon: "img/home.png",
	index: 0
}, function (button) {
	state.set('homeButton', button);
	button.onPressed.addListener(function () {
		airvantagemap.router.navigate('homeTab', { trigger: true });
	});
});

forge.tabbar.addButton({
	text: "Map",
	icon: "img/map.png",
	index: 1
}, function (button) {
	state.set('mapButton', button);
	button.onPressed.addListener(function () {
		airvantagemap.router.navigate('mapTab', { trigger: true });
	});
});

forge.tabbar.addButton({
	text: "Alerts",
	icon: "img/alert.png",
	index: 2
}, function (button) {
	state.set('alertsButton', button);
	button.onPressed.addListener(function () {
		airvantagemap.router.navigate('alertsTab', { trigger: true });
	});
});

airvantagemap.initialize();