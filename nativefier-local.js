var nativefier = require('nativefier').default;

var options = {
	"alwaysOnTop":false,
	"appCopyright":"Breakfreetrading.com",
	"icon": 'icon.ico',
	"appVersion":"1.1",
	"backgroundColor":"#191919",
	"basicAuthPassword":null,
	"basicAuthUsername":null,
	"bounce":false,
	"buildVersion":"1.1",
	"clearCache":false,
	"counter":false,
	"darwinDarkModeSupport":false,
	"disableDevTools":false, // true
	"disableGpu":false,
	"diskCacheSize":null,
	"enableEs3Apis":false,
	"fastQuit":false,
	"flashPluginDir":null,
	"fullScreen":false,
	"globalShortcuts":null,
	"height":800,
	"ignoreCertificate":false,
	"ignoreGpuBlacklist":false,
	"insecure":false,
	"internalUrls":null,
	"name":"Navigator",
	"nativefierVersion":"8.0.7",
	"proxyRules":null,
	"showMenuBar":false,
	"singleInstance":false,
	"targetUrl":"http://localhost:4200/",
	"titleBarStyle":null,
	"tray":false,
	"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
	"width":1280,
	"win32metadata":
	{
		"ProductName":"Navigator",
		"InternalName":"Navigator",
		"FileDescription":"Navigator"
	},
	"zoom":1,
	"out": "./dist-app/local/"
}

nativefier(options, function(error, appPath) {
    if (error) {
        console.error(error);
        return;
    }
    console.log('App has been nativefied to', appPath);
});
