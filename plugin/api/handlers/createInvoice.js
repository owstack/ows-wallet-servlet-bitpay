'use strict';

angular.module('owsWalletPlugin.api').service('createInvoice', function(lodash, Http, Session, System) {

	var root = {};

	/**
	 * config - The configuration from the defining plugin; see plugin.json.
	 * data - The invoice data payload to be put on the request.
	 *
	 * config = {
	 *   api: {
	 *     url: <string>,
	 *     auth: {
	 *       token: <string>
	 *     }, 
	 *     invoice: {
	 *       transactionSpeed: <string>,
	 *       notificationEmail: <string>,
	 *       notificationURL: <string>,
	 *       requiredFields: [<string>]
	 *     }
	 *   }
	 * }
   *
   * where,
   *
   * requiredFields - an array of strings indicating each specifying an invoice field.
   *   Example: ['buyer.name', 'buyer.email']
	 */

	var REQUIRED_PARAMS = [
		'config.api.url',
		'config.api.auth.token',
		'data.price',
		'data.currency'
	];

  root.respond = function(message, callback) {
		// Check required parameters.
		var missing = System.checkRequired(REQUIRED_PARAMS, message.request.data);
    if (missing.length > 0) {
	    message.response = {
	      statusCode: 400,
	      statusText: 'The request does not include ' + missing.toString() + '.',
	      data: {}
	    };
			return callback(message);
    }

    var pluginConfig = message.request.data.config;

    // Set $http config.
    var config = {
      headers: {
				'Content-Type': 'application/json',
				'x-accept-version': '2.0.0'
      }
    };

    var data = message.request.data.data;
    data.token = pluginConfig.api.auth.token;
    data.guid = Http.guid();

    // Send the request to the bitpay service.
    var http = new Http(pluginConfig.api.url, config);
    http.post('invoices/', data).then(function(response) {
    	if (response.data.error) {
    		throw new Error(response.data.error);
    	}

	    message.response = {
	      statusCode: 200,
	      statusText: 'OK',
	      data: response.data.data
	    };
			return callback(message);

    }).catch(function(error) {
	    message.response = {
	      statusCode: 400,
	      statusText: error.message || error,
	      data: {}
	    };
			return callback(message);

    });

	};

  return root;
});
