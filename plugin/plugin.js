'use strict';

angular.module('owsWalletPlugin', [
	'gettext',
	'ngLodash',
	'owsWalletPluginClient',
	'owsWalletPlugin.api',
  'owsWalletPlugin.services',
  'owsWalletPlugin.controllers'
]);

angular.module('owsWalletPlugin.api', []);
angular.module('owsWalletPlugin.controllers', []);
angular.module('owsWalletPlugin.services', []);
