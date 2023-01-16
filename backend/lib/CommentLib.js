'use strict';

const ObjectId = require('mongoose').Types.ObjectId;

const CommonLib = require('../component/lib');
const Comment = require('../models/Comment');
const async = require('async');

class CommentLib extends CommonLib{

  constructor(){
    super(Comment);
  }

  create = (comment_data, decoded, callback) => {

    comment_data.user_id = decoded._id;
    this._create(comment_data, decoded, callback);
  }

  // to be removed (use the common method with no populate)
  detail = (id, decoded, callback) => {
    Comment.findById(id).populate('user_id').populate('parent').exec(callback);
  }

  getCommentHistoryForVideo(decoded, callback) {

    Comment.find({
      user_id: decoded._id,
      video_id : {
        $not : { $type : 10 },
        $exists : true
      }
    })
    .populate('video_id', 'title source_id')
    .sort('-created')
    .exec(callback);
  }

  getCommentHistoryForVideoWithSkipOption(skip_option, decoded, callback) {

    Comment.find({
      user_id: decoded._id
      // I removed this section as I keep deleted videos comments
      // visible on comments history section as like in youtube
      /*video_id : {
        $not : { $type : 10 },
        $exists : true
      }*/
    })
    .populate('video_id', 'title source_id')
    .sort('-created')
    .skip(Number(skip_option)).limit(10)
    .exec(callback);
  }

  getVideoComments(video_id, decoded, callback) {
    Comment.find({video_id: video_id})
    .populate('user_id')
    .populate('parent')
    .sort("-created")
    .exec(callback);
  }

  getLiveChats(video_id, decoded, callback) {
    Comment.find({video_id: video_id})
    .populate('user_id')
    .sort("created")
    .exec(callback);
  }

  removeCommentWithSubComment(comment_id, decoded, callback) {

    Comment.find({ parent: comment_id }, {_id: true})
      .exec((error, data) => {

        async.each(data, (comment, async_callback) => {

          Comment.deleteOne({_id: comment._id}, (err, result) => {
            if (err) {
              return async_callback(err);
            }

              async_callback();
            });
        },
        error => {

          if(error) return callback(error);

          Comment.deleteOne({_id: comment_id }, (err, data) => {
            if (err) {
              return callback(err);
            }

            callback(null, data);
          });
        });

    });
  }

}
module.exports = CommentLib;
