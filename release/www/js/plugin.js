"use strict";angular.module("owsWalletPlugin",["gettext","ngLodash","owsWalletPluginClient","owsWalletPlugin.api","owsWalletPlugin.controllers","owsWalletPlugin.services"]),angular.module("owsWalletPlugin.api",[]),angular.module("owsWalletPlugin.controllers",[]),angular.module("owsWalletPlugin.services",[]),angular.module("owsWalletPlugin").config(function($pluginConfigProvider){$pluginConfigProvider.router.routes([{path:"/bitpay/invoices",method:"POST",handler:"createInvoice"}])}).run(function(bitpayService){owswallet.Plugin.ready(function(){})}),angular.module("owsWalletPlugin").run(["gettextCatalog",function(gettextCatalog){}]),angular.module("owsWalletPlugin.services").service("bitpayService",function($rootScope,$log){var root={};return $rootScope.$on("$pre.beforeLeave",function(event,servlet){saveData()}),root.data={},root.getData=function(cb){cb=cb||function(){},session.get("data").then(function(value){cb(null,value)}).catch(function(error){$log.error("Failed to read preferences: "+error.message+" ("+error.statusCode+")"),cb(error)})},root.saveData=function(){session.set("data",data),session.flush()},root}),angular.module("owsWalletPlugin.api").service("createInvoice",function(lodash,Http,Session,Utils){function createInvoice(url,token,data){var config={headers:{"Content-Type":"application/json","x-accept-version":"2.0.0"}};return data.token=token,data.guid=Http.guid(),new Http(url,config).post("invoices/",data)}function setBuyerSelectedTransactionCurrency(url,invoiceId,currency){var config={headers:{"Content-Type":"application/json","x-accept-version":"2.0.0"}},data={buyerSelectedTransactionCurrency:currency,invoiceId:invoiceId};return new Http(url,config).post("invoiceData/setBuyerSelectedTransactionCurrency/",data)}var root={},REQUIRED_PARAMS=["config.api.url","config.api.auth.token","data.price","data.currency"];return root.respond=function(message,callback){var missing=Utils.checkRequired(REQUIRED_PARAMS,message.request.data);if(missing.length>0)return message.response={statusCode:400,statusText:"REQUEST_NOT_VALID",data:{message:"The request does not include "+missing.toString()+"."}},callback(message);var invoice,pluginConfig=message.request.data.config,url=pluginConfig.api.url,token=pluginConfig.api.auth.token,data=message.request.data.data;createInvoice(url,token,data).then(function(response){return invoice=response.data.data,setBuyerSelectedTransactionCurrency(url,invoice.id,"BTC")}).then(function(response){return message.response={statusCode:200,statusText:"OK",data:invoice},callback(message)}).catch(function(error){return message.response={statusCode:400,statusText:"CREATE_INVOICE_ERROR",data:{message:error}},callback(message)})},root});