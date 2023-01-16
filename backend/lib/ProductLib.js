'use strict';

const CommonLib = require('../component/lib');

const Product = require('../models/Product');

class ProductLib extends CommonLib{

  constructor(){
    super(Product);
  }

  getChannelProducts(channel_id, decoded, callback) {
    Product.find({channel_id: channel_id}).exec(callback);
  }
}

module.exports = ProductLib;
