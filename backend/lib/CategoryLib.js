'use strict';

const CommonLib = require('../component/lib');

const Category = require('../models/Category');
const Video = require('../models/Video');
const async = require('async');

class CategoryLib extends CommonLib{

  constructor(){
    super(Category);
  }

  getAllCategories(decoded, callback){
    Category.find({}).sort({ title: 1 }).exec(callback);
  }

  getAllCategoriesMin(decoded, callback){
    Category.find({}, {title: true}).sort({ title: 1 }).exec(callback);
  }

  getCategory(decoded, id, callback){
    Category.findById(id, callback);
  }

  countVideo(callback){
    let video_by_category = [];
    Category.find({}, {_id: true}).exec((error_category, categories) => {
      if(error_category){
        callback(error_category);
      }

      async.each(categories, (category, async_callback) => {

        Video.countDocuments({categories: category._id, live_status: false, active: true}, (error_video, videos_count) => {
          if(error_video){
            callback(error_video);
          }

          video_by_category.push({category: category._id, videos_count: videos_count});
          async_callback();
        });

      },
      (error) => {

        if (error) {
          return callback(error);
        }
        else {
          callback(null, video_by_category);
        }

      });
    });
  }

  countVideoForCategory(category_id, callback){
    Video.countDocuments({categories: category_id, live_status: false, active: true}, (error_video, videos_count) => {
      if(error_video){
        callback(error_video);
      }

      callback(null, videos_count);
    });
  }

}

module.exports = CategoryLib;
