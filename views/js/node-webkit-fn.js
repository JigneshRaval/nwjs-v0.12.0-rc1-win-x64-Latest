//'use strict';

// Load native UI library
window.onload = function() {
	//var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

	// Get the current window
	//var win = gui.Window.get();

	/* (function(window, undefined){
		var gui = window.nwDispatcher.requireNwGui();
		console.log("GOOD",gui.Window.get());

	}(window)) */
}

var gui = require('nw.gui');
//var moment = require('moment');

var tray, isMaximized = false;

var windOpts, webkitWinModule = {
	init : function(settings) {
		windOpts = settings;
		var _this = this;

		//_this.maximizeWin();
		//_this.showDevTool();
		//gui.App.clearCache();

		// In this case tray will be collected by GC after some time and icon will disappear

	},
	openURLinDefaultBrowser : function(url) {
		gui.Shell.openExternal(url);
	},

	minimizeWin : function() {
		// Minimize the window
		//win.minimize();
		gui.Window.get().minimize();
		var options = {
			icon: "../../images/jrsnipp-logo-red-stripe.png",
			body: "Application is minimized."
		};

		//tray = new gui.Tray({ title: 'Tray', icon: '../../images/jrsnipp-logo-new.png' });
		var notification = new Notification("Coder's Cubes",options);
	},

	showNotification : function(options) {
		var notification = new Notification("Coder's Cubes",options);
	},

	minimizeToTray : function() {
		var tray;

		// Get the minimize event
		gui.Window.get().on('minimize', function() {
			// Hide window
			this.hide();

			// Show tray
			tray = new gui.Tray({ icon: '../../images/jrsnipp-logo-new.png' });

			// Show window and remove tray when clicked
			tray.on('click', function() {
				gui.Window.get().show();
				this.remove();
				tray = null;
			});
		});
	},

	maximizeWin : function() {
		if(isMaximized === false) {
			// Minimize the window
			//win.minimize();
			gui.Window.get().maximize();
			isMaximized = true;
		}
		else {
			gui.Window.get().unmaximize();
			isMaximized = false;
		}
	},

	closeWin : function() {
		// Minimize the window
		//win.minimize();
		gui.Window.get().close(true);
	},

	showDevTool : function() {
		gui.Window.get().showDevTools();
	},

	toggleFullscreenWin : function() {
		// Minimize the window
		//win.minimize();
		gui.Window.get().toggleFullscreen();
		//gui.Window.get().setTransparent(10);
	},

	reloadWin : function() {
		gui.Window.get().reload();

	},

	forceReloadWin : function() {
		gui.Window.get().reloadIgnoringCache();
	},

	getClipboardData : function() {
		// Returns the data of type from clipboard. Only text (plain text data) is supported now.
		gui.Clipboard.get('text');
	},

	setClipboardData : function(data) {
		gui.Clipboard.set(data, 'text');
	},

	clearClipboardData : function() {
		gui.Clipboard.clear();
	},

	setShortCutKeys : function(key) {
		var option = {
			key : key,
			active : function() {
				console.log("Global desktop keyboard shortcut: " + this.key + " active.");
			},
			failed : function(msg) {
				// :(, fail to register the |key| or couldn't parse the |key|.
				console.log(msg);
			}
		};
		// Create a shortcut with |option|.
		var shortcut = new gui.Shortcut(option);

		// Register global desktop shortcut, which can work without focus.
		gui.App.registerGlobalHotKey(shortcut);

		// You can also add listener to shortcut's active and failed event.
		shortcut.on('active', function() {
			console.log("Global desktop keyboard shortcut: " + this.key + " active.");
			//_this.showDevTool();
		});

		shortcut.on('failed', function(msg) {
			console.log(msg);
		});

	}

};


// Unlisten the minimize event
//win.removeAllListeners('minimize');

// Export all the functions
//module.exports = webkitWinModule;
