'use strict';

const CommonApi = require('../component/api');

const ProductLib = require('../lib/ProductLib');
const Product = require('../models/Product');

class ProductApi extends CommonApi{

  constructor(){
    
    super('product', Product, ProductLib);

    this.router.route('/channel/:channel_id').get((request, response, next) => {
	    this.wrap(this.modelLib.getChannelProducts, request.params.channel_id, request.decoded, request, next);
	})
  }
}

module.exports = ProductApi;
