'use strict';

angular.module('owsWalletPlugin.api').service('createInvoice', function(lodash, CHttp, CSession) {

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
    var validRequest = Object.keys(lodash.pick(message.request.data, REQUIRED_PARAMS)).length == REQUIRED_PARAMS.length;

    if (!validRequest) {
	    message.response = {
	      statusCode: 400,
	      statusText: 'The request must include ' + REQUIRED_PARAMS.toString() + '.',
	      data: {}
	    };
			return callback(message);
    }

	  // Request parameters.
    var config = message.request.data.config;
    var data = message.request.data.data;

    // Send the request to the bitpay service.
    var bitpay = new CHttp(config.api.url);
    bitpay.post('/invoices', data).then(function(reponse) {
	    message.response = {
	      statusCode: 200,
	      statusText: 'OK',
	      data: response
	    };
			return callback(message);

    }).catch(function(error) {
	    message.response = {
	      statusCode: 400,
	      statusText: error,
	      data: {}
	    };
			return callback(message);

    });
	};

  return root;
});
