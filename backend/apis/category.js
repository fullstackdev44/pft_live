'use strict';

const CommonApi = require('../component/api');

const CategoryLib = require('../lib/CategoryLib');
const Category = require('../models/Category');

class categoryApi extends CommonApi{

  constructor(){
    super('category', Category, CategoryLib);

    this.router.route('/getAllCategories').get((request, response, next) => {
      this.wrap(this.modelLib.getAllCategories, request.decoded, request, next);
    })

    this.router.route('/min').get((request, response, next) => {
      this.wrap(this.modelLib.getAllCategoriesMin, request.decoded, request, next);
    })

    this.router.route('/id/:id').get((request, response, next) => {
      this.wrap(this.modelLib.getCategory, request.decoded, request.params.id, request, next);
    })

    this.router.route('/countVideo').get((request, response, next) => {
      this.wrap(this.modelLib.countVideo, request, next);
    })

    this.router.route('/countVideoForCategory/:id').get((request, response, next) => {
      this.wrap(this.modelLib.countVideoForCategory, request.params.id, request, next);
    })
  }
}

module.exports = categoryApi;