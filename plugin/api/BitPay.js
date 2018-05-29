'use strict';

angular.module('owsWalletPlugin.api').factory('BitPay', function (lodash, $log, ApiMessage, Session, Transaction, popupService) {

  var pluginId = 'org.openwalletstack.wallet.plugin.servlet.bitpay';

  /**
   * Constructor.
   * @param {Object} config - The configuration for the servlet.
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
  function BitPay(store) {
    var self = this;

    var config = Session.getInstance().plugin.dependencies[pluginId][store];
    if (!config) {
      throw new Error('Could not create instance of BitPay, check plugin configuration');
    }

    /**
     * Public functions
     */

    /**
     * Create a new invoice.
     * @param {Object} data - Payment request data.
     * @return {Promise<CBitPayInvoice>} A promise for the invoice.
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
        url: '/bitpay/invoices',
        data: {
          config: config,
          data: data
        },
        responseObj: 'Invoice'
      }

      return new ApiMessage(request).send();
    };

    /*
     *
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
        $log.error('BitPay.sendPayment():' + error.message + ', detail:' + error.detail);
        throw new Error(error.message);
      });
    };

    return this;
  };

  BitPay.pluginId = function() {
    return pluginId;
  };
 
  return BitPay;
});
