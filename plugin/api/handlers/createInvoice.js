'use strict';

angular.module('owsWalletPlugin.apiHandlers').service('createInvoice', function(lodash,
  /* @namespace owsWalletPluginClient.api */ Http,
  /* @namespace owsWalletPluginClient.api */ Session,
  /* @namespace owsWalletPluginClient.api */ Utils) {

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
		var missing = Utils.checkRequired(REQUIRED_PARAMS, message.request.data);
    if (missing.length > 0) {
	    message.response = {
	      statusCode: 400,
	      statusText: 'REQUEST_NOT_VALID',
	      data: {
	      	message: 'The request does not include ' + missing.toString() + '.'
	      }
	    };
			return callback(message);
    }

    var pluginConfig = message.request.data.config;

    var url = pluginConfig.api.url;
    var token = pluginConfig.api.auth.token;
    var data = message.request.data.data;

    var invoice;

    createInvoice(url, token, data).then(function(response) {
    	invoice = response.data.data;
			return setBuyerSelectedTransactionCurrency(url, invoice.id, 'BTC'); // TODO: fix when understand how this works

    }).then(function(response) {

	    message.response = {
	      statusCode: 200,
	      statusText: 'OK',
	      data: invoice
	    };
			return callback(message);

    }).catch(function(error) {

	    message.response = {
	      statusCode: 400,
	      statusText: 'CREATE_INVOICE_ERROR',
	      data: {
	      	message: error
	      }
	    };
	    return callback(message);
    });
	};

	function createInvoice(url, token, data) {
    // Set $http config.
    var config = {
      headers: {
				'Content-Type': 'application/json',
				'x-accept-version': '2.0.0'
      }
    };

    data.token = token;
    data.guid = Http.guid();

    // Send the request to the bitpay service.
    var http = new Http(url, config);
    return http.post('invoices/', data);
	};

	function setBuyerSelectedTransactionCurrency(url, invoiceId, currency) {
    // Set $http config.
    var config = {
      headers: {
				'Content-Type': 'application/json',
				'x-accept-version': '2.0.0'
      }
    };

		var data = {
			buyerSelectedTransactionCurrency: currency,
			invoiceId: invoiceId
		};

    var http = new Http(url, config);
    return http.post('invoiceData/setBuyerSelectedTransactionCurrency/', data);
	};

  return root;
});
