'use strict';

angular.module('owsWalletPlugin').config(function($pluginConfigProvider) {

  /**
   * API routes for our service.
   * A match is made by searching routes in order, the first match returns the route.
   */
  $pluginConfigProvider.router.routes([
    { path: '/bitpay/invoices', method: 'POST', handler: 'createInvoice' }
  ]);

})
.run(function(bitpayService) {
  // Bump bitpayService.

  owswallet.Plugin.ready(function() {

    // Do initialization here.

  });

});
