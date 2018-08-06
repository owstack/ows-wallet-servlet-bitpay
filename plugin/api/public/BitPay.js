'use strict';

angular.module('owsWalletPlugin.api.bitpay').factory('BitPay', function (lodash, $log, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError,
  /* @namespace owsWalletPlugin.api.bitpay */ BitPayServlet,
  /* @namespace owsWalletPlugin.api.bitpay */ Invoice,
  /* @namespace owsWalletPluginClient.api */ PluginApiHelper,
  /* @namespace owsWalletPluginClient.api */ Transaction) {

  /**
   * Constructor.
   * @param {Object} config - The configuration ID for the servlet.
   * @constructor
   *
   * config = {
   *   api: {
   *     url: <string>,
   *     auth: {
   *       token: <string>
   *     },
   *   },
   *   transactionSpeed: <string>,
   *   notificationEmail: <string>,
   *   notificationURL: <string>,
   *   invoice: {
   *     required: <array>
   *   }
   * }
   *
   * invoice.required - an array of strings listing the required field for creating an invoice.
   *   Exmaple ['buyer.name', 'buyer.email', 'buyer.phone' , 'buyer.address1' , 'buyer.locality', 'buyer.region', 'buyer.postalCode']
   */
  function BitPay(configId) {
    var self = this;

    var servlet = new PluginApiHelper(BitPayServlet);
    var apiRoot = servlet.apiRoot();
    var config = servlet.getConfig(configId);

    /**
     * Public functions
     */

    /**
     * Create a new invoice.
     * @param {Object} data - Payment request data.
     * @return {Promise<Invoice>} A promise for the invoice.
     *
     * @See https://bitpay.com/api#resource-Invoices
     *
     * data = {
     *   price: [required] <number>,
     *   currency: [required] <string>,
     *   orderId: <string>,
     *   itemDesc: <string>,
     *   itemCode: <string>,
     *   posData: <string>,
     *   physical: <boolean>,
     *   buyer: {
     *     name: <string>,
     *     address1: <string>,
     *     address2: <string>,
     *     locality: <string>,
     *     region: <string>,
     *     postalCode: <string>,
     *     country: <string>,
     *     email: <string>,
     *     phone: <string>,
     *     notify: <string>
     *   },
     *   transactionSpeed: <string>,
     *   notificationEmail: <string>,
     *   notificationURL: <string>
     * }
     */
    this.createInvoice = function(data) {
      var request = {
        method: 'POST',
        url: apiRoot + '/bitpay/invoices',
        data: {
          config: config,
          data: data
        }
      };

      return new ApiMessage(request).send().then(function(response) {
        return new Invoice(response.data);

      }).catch(function(error) {
        throw new ApiError(error);
        
      });
    };

    /**
     * Convenience function to send a payment through this BitPay instance. This function handles creating the invoice,
     * creating the wallet transaction, confirming the transaction, and sending the payment.
     * @param {Object} wallet - A Wallet object.
     * @param {Object} data - An Invoice object.
     * @param {function} confirmHanlder - A function that is called when the payment must be confirmed before sending.
     * @return {Promise} A promise at completion.
     */
    this.sendPayment = function(wallet, data, confirmHandler) {
      return self.createInvoice(data).then(function(invoice) {
        $log.debug('Got invoice: ' + JSON.stringify(invoice));

        // Create an accessor for the payment URL.
        var c = wallet.currency.toUpperCase();

        // Create a new transaction for paying the invoice.
        return new Transaction({
          walletId: wallet.id,
          urlOrAddress: invoice.paymentCodes[c].BIP73
        });

      }).then(function(tx) {

        if (tx.shouldConfirm) {
          confirmHandler().then(function() {
            tx.send();

          }).catch(function() {
            // User did not confirm.
            // Catch and discard.
          });

        } else {
          tx.send();

        }
        return;

      }).catch(function(error) {
        throw new ApiError(error);
      });
    };

    return this;
  };
 
  return BitPay;
});
