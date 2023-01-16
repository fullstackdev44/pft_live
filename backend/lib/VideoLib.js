'use strict';

const async = require('async');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const CommonLib = require('../component/lib');

const VimeoLib = require('../lib/VimeoLib');
const ChannelLib = require('../lib/ChannelLib');

const Video = require('../models/Video');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Playlist = require('../models/Playlist');
const Event = require('../models/Event');
const Comment = require('../models/Comment');
const Payment = require('../models/Payment');
const Category = require('../models/Category');

const sgMail = require('@sendgrid/mail');

// configurations
const uploadsDefaultPageSize = 8;
const trendingDaysRange = 7;

const SOCKET_URL = process.env.API_BASE_URL;
var io = require('socket.io-client');
var socket = io.connect(SOCKET_URL, {reconnect: true});



// New twilio live update
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_CLIENT = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
// End new twilio live update code

class VideoLib extends CommonLib{

  constructor(){
    super(Video);
  }

  getAll = (decoded, callback) => {
    VimeoLib.checkUploadingVideos(function(err, data){
      console.log("Done checking ....");

      if (err){
        return callback(err)
      }

      Video.find({ active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null} }).exec(callback);
    })
  }

  createVideo = async (video_data, decoded, callback) => {

    const new_video = new Video();

    video_data.short_id = shortid.generate();

    for (const key in video_data) {
      if ({}.hasOwnProperty.call(video_data, key)) {
        new_video[key] = video_data[key];
      }
    }

    // New live code
    let user_full_name = await new Promise(resolve => { User.findById(decoded._id, {full_name: true}).exec((error, data) => resolve(data.full_name)) });
    user_full_name = user_full_name.replace(/[^a-zA-Z0-9]/g, '');
    let roomName = user_full_name + new Date().getTime();
    new_video.live_info['roomName'] = roomName;
    // end new live code

    if(new_video.live_status == false) {
      // update channel videos number meta
      if(new_video.channel_id){

        Channel.findById(new_video.channel_id, {meta: true}, (error, channel) => {

          if(error){
            return callback(error);
          }

          Video.countDocuments({channel_id: channel._id, live_status: false, active: true}, (error, videos_count) => {

            if(error){
              return callback(error)
            }

            if(!channel.meta){
              channel.meta = {};
            }

            channel.meta.videos = videos_count;
            channel.save();
          })
        })
      }
    }

    // update categories meta data
    new_video.categories = new_video.categories.map(current => current._id ? current._id : current);
    if(new_video.live_status == false) {
      for(const category_index in new_video.categories){

        Category.findById(new_video.categories[category_index], {meta: true}, (error, category) => {

          if(error){
            return callback(error);
          }

          if(category){
            Video.countDocuments({categories: category._id, live_status: false, active: true}, (error, videos_count) => {

              if(error){
                return callback(error);
              }

              if(!category.meta){
                category.meta = {};
              }

              category.meta.videos = videos_count;
              category.save();
            })
          }
        })
      }
    }

    new_video.save((error, saved_video) => {

      if(error){
        return callback(error);
      }

      callback(null, {data: new_video._id});
    });
  }

  updateVideo = (video_data, decoded, callback) => {

    // delete video_data._id;

    Video.findById(video_data._id, async (error, video) => {
        try {
          //TWILIO_CLIENT.video.v1.rooms.list({status: 'in-progress', limit: 50})
            //         .then(rooms => rooms.forEach(r => ));
                     // if(video.live_info.roomName == r.uniqueName){
                     //    TWILIO_CLIENT.video.v1.rooms(r.sid)
                     //   .update({status: 'completed'})
                     //   .then(room => console.log(room.uniqueName));
                     //  }
       
      } catch(e) {
        return callback(null, { status : e})
      } 
      if(error){
        return callback(error);
      }

      if(!video){
        return callback({message: 'NotFound'});
      }

      let new_channel_id = video_data.channel_id;

      if(new_channel_id && new_channel_id._id){
        new_channel_id = new_channel_id._id;
      }

      // updating old channel meta data
      if(video.channel_id){

        Channel.findById(video.channel_id, {meta: true}, (error, channel) => {

          Video.countDocuments({channel_id: channel._id, live_status: false, active: true}, (error, video_count) => {

            channel.meta.videos = video_count;
            channel.save();
          })
        })
      }

      // updating new channel meta data
      if(new_channel_id){

        Channel.findById(new_channel_id, {meta: true}, (error, channel) => {

          Video.countDocuments({channel_id: channel._id, live_status: false, active: true}, (error, video_count) => {

            channel.meta.videos = video_count;
            channel.save();
          })
        })
      }

      // update old categories meta data
      video_data.categories = video_data.categories.map(current => current._id ? current._id : current);

      const removed_categories = video.categories.filter(current => video_data.categories.indexOf(current) < 0);
      for(const category_index in removed_categories){

        Category.findById(removed_categories[category_index], {meta: true}, (error, category) => {

          if(category){

            Video.countDocuments({categories: category._id, live_status: false, active: true}, (error, videos_count) => {

              if(!category.meta){
                category.meta = {};
              }

              category.meta.videos = videos_count;
              category.save();
            })
          }
        })
      }

      // update new categories meta data
      const new_categories = video_data.categories.filter(current => video.categories.indexOf(current) < 0);
      for(const category_index in new_categories){

        Category.findById(new_categories[category_index], {meta: true}, (error, category) => {

          if(category){

            Video.countDocuments({categories: category._id, live_status: false, active: true}, (error, videos_count) => {

              if(!category.meta){
                category.meta = {};
              }

              category.meta.videos = videos_count;
              category.save();
            })
          }
        })
      }
      let custom_views = video['meta'].views;
      let custom_viewers = video['viewers'];
      //console.log(video);
      for (const key in video_data) {
        if ({}.hasOwnProperty.call(video_data, key)) {
            video[key] = video_data[key];
        }
      }
      //console.log(custom_views);
      //delete video.meta['views'];
      
       //console.log('here');
      
      // New live code
      // this is used to make sure previous live data won't cause a bug after the live update (can be removed if a new database is used)
      if(video.live_info && !video.live_info.roomName) {
        let user_full_name = await new Promise(resolve => { User.findById(decoded._id, {full_name: true}).exec((error, data) => resolve(data.full_name)) });
        user_full_name = user_full_name.replace(/[^a-zA-Z0-9]/g, '');
        let roomName = user_full_name + new Date().getTime();
        video.live_info['roomName'] = roomName;
      }
      video.meta['views'] = custom_views;
      video['viewers'] = custom_viewers;
      //console.log(video.meta['views']);
      // end new live code
     // console.log(video);
      // video.save(callback);
      video.save((err, saved) => {
        if (err) {
          callback(err);
        }

        if(saved && saved.live_status == true) {
          socket.emit('send_like_to_server', {
            likes: [{live_id: video._id, likes: video.meta.likes, dislikes: video.meta.dislikes}]
          });
        }

        callback(null, saved);
      });
    })
  }

  getVideoBySourceId(source_id, decoded, callback) {
    Video.findOne({source_id: source_id/*, active: true*/}) // active should be commented here so the user who buy the video will able to play it even if the coach who upload the video delete it
    .populate('channel_id')
    .populate({
      path: 'categories',
      select: 'title'
    })
    .exec((error, video) => {
      if(error) {
        return callback(error);
      }

      if(video.active == true) {
        return callback(null, video);
      }

      if(video.active == false) {
        // Check if the user purchase the video, allow user to play it even if it's deleted from website
        User.findById(decoded._id, {purchased_videos :true}).exec((err, user) => {
          if(err) {
            return callback(err);
          }

          if(user.purchased_videos.indexOf(video._id) >= 0) {
            return callback(null, video);
          }

          callback('Forbidden');
        })
      }
    });
  }

  getVideoBySourceIdLight(source_id, decoded, callback) {
    Video.findOne({source_id: source_id}, {title: true, thumbnail: true, description: true})
    .exec((error, video) => {

      if(error) {
        return callback(error);
      }

      callback(null, video);
    });
  }

  getVideosForCategory(category_id, page, page_size, callback) {

    Video.find({categories: category_id, live_status: false, active: true})
    .skip(Number(page) * Number(page_size))
    .limit(Number(page_size))
    .populate('channel_id')
    .sort({ 'meta.views': -1 })
    .exec(callback);
  }

  // Can be overrided, I don't know yet the right algorithm to get it
  getPopularVideo(decoded, callback) {
    VimeoLib.checkUploadingVideos(function(err, data) {
      if (err){
        return callback(err);
      }

      Video.find({ active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null} }).populate('channel_id','title').sort({'meta.views': -1, 'created': -1}).limit(8).exec(callback);
    })
  };

  // Can be overrided, I don't know yet the right algorithm to get it
  getPopularVideoWithSkipOption(skip_option, limit_option, callback) {
    VimeoLib.checkUploadingVideos(function(err, data) {
      if (err){
        return callback(err);
      }

      Video.find({ active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null} })
      .populate('channel_id','title')
      .sort({'meta.views': -1, 'created': -1})
      .skip(Number(skip_option))
      .limit(Number(limit_option))
      .exec(callback);
    })
  };

  _getUpdatesFromSubscription(user, decoded, callback) {

    // Steps (just an idea):
    // get last channels list where user has been subscribed
    // and get last video uploaded by theses channel
    // (just last video for "index" template and last video list for "update from subs" template)

    if(!user.subscribed_channels){
      return callback(null, []);
    }

    let subscribed_channel_list = user.subscribed_channels.reverse().slice(0, 4);
    let new_video_published = [];
    let updates_from_subs = [];

    async.each(subscribed_channel_list, (subscribed_info, async_callback) => {

      // Activate channel_id filter when our mongoose find() with another document reference works
      Video.find({active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null} , channel_id: channel})
      .populate('channel_id','title avatar_card avatar_color')
      .sort({created: -1})
      .exec(function(error, videos) {

        if (error) {
          return async_callback(error);
        }

        videos[0] ? new_video_published.push(videos[0]) : '' ;
        videos[0] ? updates_from_subs.push(videos[0]) : '' ;
        videos[1] ? updates_from_subs.push(videos[1]) : '' ;
        videos[2] ? updates_from_subs.push(videos[2]) : '' ;
        videos[3] ? updates_from_subs.push(videos[3]) : '' ;
        // updates_from_subs = videos.length ? videos.slice(0, 4) : [];

        async_callback();
      });
    },
    (error) => {

      if (error) {
        return callback(error);
      }
      else {
        new_video_published.sort(function(a, b){return b.created - a.created});

        let data = {
          new_video_published: new_video_published,
          updates_from_subs: updates_from_subs
        }
        callback(null, data);
      }

    });

  }

  getTrendings(page, page_size, callback){

    let lastWeekDay = new Date();
    lastWeekDay.setDate(lastWeekDay.getDate() - trendingDaysRange);

    Event.find({object: "VIDEO", type: "VIEW", created: {$gte: lastWeekDay}})
    .sort({"created": -1})
    .exec((error, events) => {

      if(error){
        return callback(error);
      }

      let video_ids = events.map(current => current.ref);

      let aggregated_videos = video_ids.reduce((result, current) => {

        if(result[current]){
          result[current] += 1;
        }
        else{
          result[current] = 1;
        }

        return result;

      }, []);

      let items = Object.keys(aggregated_videos).map(key => [key, aggregated_videos[key]]);
      items.sort((a, b) => b[1] - a[1]);

      video_ids = items.map(current => current[0]).slice(Number(page) * Number(page_size), Number(page_size));

      Video.find({_id: {$in: video_ids}, live_status: false, active: true})
        .populate("channel_id")
        .sort()
        .exec((error, videos) => {

          if(error){
            return callback(error);
          }

          videos.sort((a, b) => aggregated_videos[b._id.toString()] - aggregated_videos[a._id.toString()]);

          if(videos.length < page_size){

            // state: page option is obsolete in this case

            Video.find({_id: {$nin: video_ids}, live_status: false, active: true})
            .sort({"meta.views": -1})
            .populate("channel_id")
            .limit(Number(page_size - videos.length))
            .exec((error, mostViewedVideos) => {

              if(error){
                return callback(error);
              }

              callback(null, videos.concat(mostViewedVideos));
            })
          }
          else{
            callback(null, videos);
          }
        })
    })
  }

  // Can be overrided, I don't know yet the right algorithm to get it
  getVideoByFilter(filter, decoded, callback) {

    const search_regex = new RegExp(filter.term, 'i');
    const request_options = { title: search_regex };
    let request = { 'title': search_regex };

    if (filter.type == 'channel' || filter.type == 'shows') {

      if (filter.type == 'shows') {
        request.type = 'SHOWS';
      } else {
        request.type = 'CHANNEL';
      }

      if (filter.sort_by == 'relevance') {
        Channel.find({ title: search_regex, active: true}).exec(callback);
      } else if (filter.sort_by == 'upload_date') {
        // Need to get all channel by filter search term,
        // get all most recent video of theses channels
        // sort these video by publish date and show channel info in fronted

        // NOT USED FOR NOW, AS SORT USE DIRECTLY CHANNEL CREATED FIELD INSTEAD OF YOUTUBE ALGORITHME WHO USE UPLOAD_DATE
        // Channel.find(request_options).exec(function(error, data) {
        //   if (error) {
        //     callback(error);
        //   }

        //   let new_video_published = [];
        //   async.each(data, (channel, async_callback) => {
        //     // Activate channel_id filter when our mongoose find() with another document reference works
        //     Video.find({active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null} /*channel_id: channel*/}).populate('channel_id','title subscribers').sort({'created': -1}).exec(function(error, videos) {
        //       if (error) {
        //         async_callback(error);
        //       }
        //       videos[0] ? new_video_published.push(videos[0]) : '' ;

        //       async_callback();
        //     });
        //   },
        //   (error) => {
        //     if (error) {
        //       callback(error);
        //     } else {
        //       new_video_published = new_video_published.sort((a, b) => b.date - a.date);

        //       callback(null, new_video_published);
        //     }
        //   });
        // });

        Channel.find({ title: search_regex, active: true}).sort({'created': -1}).exec(callback);
      }
      else if (filter.sort_by == 'view_count') {
        Channel.find({ title: search_regex, active: true}).sort({'meta.views': -1}).exec(callback);
      }
      else if (filter.sort_by == 'rating') {
        // NOT USED FOR NOW AS SORT USE DIRECTLY CHANNEL SUBSCRIBERS FIELD
        // Channel.aggregate([
        //   {
        //     $project: {
        //       "title": 1,
        //       "detail": 1,
        //       "profile_image": 1,
        //       "subscribers": 1,
        //       "meta": 1,
        //       "subscribers_count": { $cond: { if: { $isArray: "$subscribers" }, then: { $size: "$subscribers" }, else: "NA"} }
        //     }
        //   },
        //   {
        //     $match: request_options
        //   }
        // ]).sort({'subscribers_count' : -1}).exec(callback);

        Channel.find({ title: search_regex, active: true}).sort({'meta.subscribers': -1}).exec(callback);
      }

    }
    else if (filter.type == 'playlist') {

      if (filter.sort_by == 'relevance') {
        Playlist.find(request_options).populate('videos').exec(callback);
      }
      else if (filter.sort_by == 'upload_date') {
        Playlist.find(request_options).populate('videos').sort({'created': -1}).exec(callback);
      }
      else if (filter.sort_by == 'view_count') {
        Playlist.find(request_options).populate('videos').sort({'meta.views': -1}).exec(callback);
      }
      else if (filter.sort_by == 'rating') {
        Playlist.aggregate([
          {
            $project: {
              "title": 1,
              "videos": 1,
              "videos_count": { $cond: { if: { $isArray: "$videos" }, then: { $size: "$videos" }, else: "NA"} }
            }
          },
          {
            $match: request_options
          }
        ]).sort({'videos_count' : -1}).exec((error, result) => {
          Video.populate(result, {path: "videos"}, callback);
        });
      }
    } else {
      // if (filter.type == 'video' || filter.type == 'movie') {

      let upload_date = undefined;
      let duration = undefined;
      let now = new Date();
      const first_day_of_week = now.getDate() - now.getDay();

      switch(filter.upload_date){
        case 'last_hour':
          upload_date = new Date(now.setHours(now.getHours() - 1));
          break;
        case 'today':
          upload_date = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this_week':
          now.setDate(first_day_of_week + 1);
          upload_date = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this_month':
          now.setDate(2);
          upload_date = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this_year':
          now.setFullYear(now.getFullYear(), + 1, 0);
          upload_date = new Date(now.setDate(1));
          break;
      }

      if ( upload_date != null ) {
        // request.created = { $gte: upload_date };
        request = { 'created': { $gte: upload_date }, 'title': search_regex };
      } else {
        request = { 'title': search_regex };
      }
      if (filter.duration == 'short') {
        request.duration = { $lte: '241' };
      } else if (filter.duration == 'long' ) {
        request.duration = { $gte: '1200' };
      }
      if (filter.features) {
        switch(filter.features){
        case 'live':
          request.live_status = true;
          break;
        case '4K':
          request.height = 2160;
          break;
        case 'HD':
          request.height = 1080;
          break;
        case '720p':
          request.height = 720;
          break;
        case '480p':
          request.height = 480;
          break;
        case '360p':
          request.height = 360;
          break;
        case '240p':
          request.height = 240;
          break;
        default:
          break;
        }
      }
      if (filter.type == 'movie') {
        request.video_type = 'MOVIE';
      } else {
        request.video_type = 'VIDEO';
      }
      let sort_video_by = {};
      if (filter.sort_by == 'upload_date') {
        sort_video_by = { created: -1 }
      }
      else if (filter.sort_by == 'view_count') {
        sort_video_by = {'meta.views': -1}
      }
      else if (filter.sort_by == 'rating') {
        sort_video_by = {'meta.likes': -1}
      }
      request.active = true;
      request.upload_status = 'COMPLETE';
      if (request.live_status == true) {
        request.live_status = true;
      } else {
        request.live_status = false;
      }
      Video.find(request).populate('channel_id', 'title').sort(sort_video_by).exec((error, data) => {
        callback(null, data);
      });
    }
  };

  searchInChannel(channel_id, search_term, page, decoded, callback) {
    const request_options = {channel_id: channel_id, title: new RegExp(search_term, 'i'), active: true, live_status: false, upload_status: "COMPLETE"}
    Video.find(request_options).sort({created: -1}).skip(page * 8).limit(8).exec(callback);
  }

  // Can be overrided, I don't know yet the right algorithm to get it
  getChannelRecentVideos(channel_id, page, decoded, callback) {
    const request_options = {channel_id: channel_id, active: true, live_status: false, upload_status: "COMPLETE"};
    Video.find(request_options).sort({created: -1}).skip(page * 8).limit(8).exec(callback);
  };

  getChannelFeaturedVideos(channel_id, page, decoded, callback) {

    Channel.findById(channel_id, {featured_videos: true})
      .populate({
        path: 'featured_videos',
        populate: {
          path: 'channel_id',
          select: 'title'
        }
      })
      .skip(page * 8).limit(8)
      .exec((error, channel) => {
        if(error){
          return callback(error);
        }

        if (channel && channel.featured_videos)
            return callback(null, channel.featured_videos);
        else
            return callback(null, []);
      })
  };

  // Can be overrided, I don't know yet the right algorithm to get it
  getChannelPopularVideos(channel_id, page, decoded, callback) {
    const request_options = {channel_id: channel_id, active: true, live_status: false, upload_status: "COMPLETE"};
    Video.find(request_options).sort({'meta.views': -1}).skip(page * 8).limit(8).exec(callback);
  };

  // Can be overrided, I don't know yet the right algorithm to get it
  getChannelVideos(channel_id, page, page_size, decoded, callback) {

    const request_options = {channel_id: channel_id, active: true, live_status: false, upload_status: "COMPLETE"};
    Video.find(request_options)
      .skip(page * (page_size ? page_size : uploadsDefaultPageSize))
      .limit(page_size ? page_size : uploadsDefaultPageSize)
      .sort({created: -1})
      .exec(callback);
  };

  getChannelOfflineVideos(channel_id, page, decoded, callback) {
    const request_options = {channel_id: channel_id, active: true, live_status: false, upload_status: "COMPLETE"};
    Video.find(request_options).skip(page * 8).limit(8).exec(callback);
  };

  // Can be overrided, I don't know yet the right algorithm to get it
  importVideoLink(video_link, decoded, callback) {
    // --------------------------------
    // Insert your code here
    // --------------------------------
  };

  // Can be overrided, I don't know yet the right algorithm to get it
  getUserLastestVideoPublished(decoded, callback) {
    const request_options = {user_id: decoded._id, active: true, live_status: false};
    Video.find(request_options)
    .sort({created: -1}).limit(8).exec(callback);
  };

  // Can be overrided, I don't know yet the right algorithm to get it
  getUserUploadedVideo(decoded, callback) {
    const request_options = {user_id: decoded._id, active: true, live_status: false, upload_status: "COMPLETE"};
    Video.find(request_options)
    .populate("channel_id", "title")
    .sort({created: -1}).exec(callback);
  };

  // NOT NEEDED AS FAVORITE VIDEOS IS NOW IN USER MODEL
  // --------------------------------------------------
  // Can be overrided, I don't know yet the right algorithm to get it
  // getUserFavoriteVideo(decoded, callback) {
  //   const request_options = {user_id: decoded._id, active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null}};
  //   Video.find(/*request_options*/)
  //   .sort({'meta.likes': -1}).exec(callback);
  // };

  // to be implemented
  getUserHistory(decoded, callback){
    return callback(null, []);
  };

  // --------------------------------
  // TODO: improve to get video with
  // similar categories
  // --------------------------------
  getSimilarVideos(video_id, callback) {
    const TOTAL_VIDEOS = 8;
    Video.findOne({source_id: video_id, live_status: false/*, active: true*/}) // active should be commented here so the user who buy the video will able to get similar video even if the coach who upload the video delete it
    .populate('categories')
    .exec(function(err, data){

      if (err){
        return callback(err);
      }

      if(!data){
        return callback({type: "NotFound"});
      }

      // 1. try to find videos with similar tags
      // and categories (TODO)
      // 2. if the aren't enought

      // Andry Old Code (I kept it in case where Eldad change on his decision)
      // Video.find(
      //   { $text: { $search: data.tags } },
      //   { score: { $meta: "textScore" } },
      //   { active: true, live_status: false, channel_id: {$ne: null}}
      // )
      // .populate('channel_id','title')
      // .sort( { score: { $meta: "textScore" } } )
      // .limit(TOTAL_VIDEOS)

      // Random Video
      Video.aggregate([{ $match: { "active": true, "live_status": false, "upload_status": "COMPLETE" }},{ $sample: { size: TOTAL_VIDEOS }}])
      .exec(function(error, videos){
        if (error){
          return callback(error);
        }

        Channel.populate(videos, {path: 'channel_id', select: 'title'}, function(err, populatedChannelForFronted) {
          let num_diff = TOTAL_VIDEOS;
          if (videos) {
            videos = videos.filter(item => item.source_id !== video_id);
            num_diff = TOTAL_VIDEOS - videos.length;
          } else {
            videos = [];
          }

          if (num_diff <= 0) { // Retrieved at least TOTAL_VIDEOS videos
            videos = videos.filter(item => item.active == true && item.upload_status == 'COMPLETE');
            return callback(null, videos);
          }
          else {
            Video.find({live_status: false, active: true})
            .populate('channel_id','title')
            //.limit(num_diff)
            .sort({created: -1})
            .exec(function(more_videos_error, more_videos){
              if (more_videos_error){
                return callback(more_videos_error);
              }

              let count = videos.length;
              let index = 0;
              // add more videos (avoid duplicates)
              while(count < TOTAL_VIDEOS && count < more_videos.length) {
                if ( !videos.includes(more_videos[index]) ) {
                  videos.push(more_videos[index])
                  count++;
                }
                index++;
              }

              videos = videos.filter(item => item.active == true && item.upload_status == 'COMPLETE');
              return callback(null, videos);
            });
          }
        });
      });

    });
  };

  async reportPlay(video_id, decoded, callback){

    // Increment video for both non loged and loged user
    let video = await new Promise(resolve => {
      // Video.findOne({source_id: video_id}, (error, video) => resolve(video));
      Video.findById(video_id, (error, video) => resolve(video));
    })

    if(!video){
      return(callback({message: "NotFound"}));
    }

    // migration check
    if(!video.viewers){
      video.viewers = [];
    }

    // OK! We need more view counts,
    // we don't care about double counts for now
    // we will disable or update later
    if(decoded) {
      video.meta.views += 1; // refer to comment above
      const user_index = video.viewers.indexOf(decoded._id);
      if(user_index === -1){
        video.viewers.push(decoded._id);
        //video.meta.views += 1;
      }
    }

    if(!decoded){
      video.meta.views += 1;
    }

    //video.save();

    updateChannelViews(video.channel_id);
    // non connected user
    if(!decoded){
      return callback(null, true);
    }

    User.findById(decoded._id, {recommendations: true, videos_history: true}, async (error, user) => {

      if(error) return callback(error);

      if(!user){
        return callback({message: "Forbidden"});
      }

      // activate this if not change recommendations if video is in play history
      // if(user.videos_history.map(current => current.toString()).indexOf(video_id) > -1){
      //   return callback(null, true);
      // }

      // get recommendations
      // - one video from the same playlist

      // Moved on the top
      /*let video = await new Promise(resolve => {
        // Video.findOne({source_id: video_id}, (error, video) => resolve(video));
        Video.findById(video_id, (error, video) => resolve(video));
      })

      if(!video){
        return(callback({message: "NotFound"}));
      }*/

      // - video on the same channel
      let from_channel_rec = await new Promise(resolve => {
        Video.find({channel_id: video.channel_id, live_status: false, active: true, _id: {$ne: video._id}})
        .sort({"meta.views": -1})
        .exec((error, videos) => {
          resolve(videos)
        });
      })

      if(!from_channel_rec){
        from_channel_rec = [];
      }

      // - video on the same category
      let from_category_rec = await new Promise(resolve => {

        let all_videos = [];

        async.each(video.categories, (category, async_callback) => {

          Video.find({categories: {$in: [ObjectId(category)]}, live_status: false, active: true, _id: {$ne: video._id}, channel_id: {$ne: null}})
          .sort({"meta.views": -1})
          .exec((error, videos) => {

            if(error) return async_callback(error);
            all_videos = all_videos.concat(videos);
            async_callback();
          })
        },
        error => {

          if(error) return callback(error);
          resolve(all_videos)
        })
      })

      if(!from_category_rec){
        from_category_rec = [];
      }

      // Moved on the top
      /*video.meta.views += 1;
      video.save();*/

      let new_video_event = new Event();
      new_video_event.user = decoded._id;
      new_video_event.type = "VIEW"
      new_video_event.object = "VIDEO";
      new_video_event.ref = video._id;

      new_video_event.save();

      let new_channel_event = new Event();
      new_channel_event.user = decoded._id;
      new_channel_event.type = "VIEW"
      new_channel_event.object = "CHANNEL";
      new_channel_event.ref = video.channel_id;

      new_channel_event.save();

      user.videos_history.map(current => current.toString()).indexOf(video._id.toString()) > -1 ?
        user.videos_history.splice(user.videos_history.map(current => current.toString()).indexOf(video._id.toString()), 1) : '';

      user.videos_history.unshift(video);

      // recommendations
      from_category_rec = from_category_rec.filter(current => user.videos_history.indexOf(current._id) === -1);
      from_channel_rec = from_category_rec.filter(current => user.videos_history.indexOf(current._id) === -1);

      if(from_category_rec.length > 3){
        from_category_rec = from_category_rec.slice(0, 3);
      }

      if(from_channel_rec.length > 3){
        from_channel_rec = from_channel_rec.slice(0, 3);
      }

      let new_recommendations = from_channel_rec.concat(from_category_rec);

      // map _ids
      new_recommendations = new_recommendations.map(current => {
        if(current._id){
          return current._id;
        }

        return current;
      })

      user.recommendations = new_recommendations.concat(user.recommendations);

      // unique
      user.recommendations = user.recommendations.filter((elem, index) => user.recommendations.indexOf(elem) === index);
      // limit to 8
      user.recommendations = user.recommendations.slice(0, 8);

      user.save((error, data) => callback(null, true));
    })
  }

  updatePlayState(data, decoded, callback) {

    User.findById(decoded._id, {continue_watching_videos: true}, async (error, user) => {

      const video_index = user.continue_watching_videos.map(current => current.video.toString()).indexOf(data.video);

      if(video_index > -1){

        if(!data.current_time){
          user.continue_watching_videos.splice(video_index, 1);
        }
        else{
          // user.continue_watching_videos[video_index].current_time = data.current_time;
          user.continue_watching_videos.splice(video_index, 1);
          user.continue_watching_videos.push({video: data.video, current_time: data.current_time});
        }
      }
      else{

        if(user.continue_watching_videos.length >= 8){
          user.continue_watching_videos.shift();
        }

        user.continue_watching_videos.push({video: data.video, current_time: data.current_time});
      }

      user.save(callback);
    })
  }

  flag(data, decoded, callback) {

    Video.findById(data.video, {flags: true, title: true, channel_id: true}, {populate: { path: 'channel_id', select: 'title' } }, (error, video) => {

      if(error){
        return callback(error);
      }

      if(!video){
        return callback({type: "NotFound"});
      }

      if(!video.flags){
        video.flags = [];
      }

      data.flags.user = decoded._id;
      video.flags.push(data.flags);

      let inappropriate = data.flags.inappropriate && data.flags.inappropriate == true ? 'INAPPROPRIATE, ' : '';
      let copyrighted = data.flags.copyrighted && data.flags.copyrighted == true ? 'COPYRIGHTED,' : '';
      let comment = data.flags.comment && data.flags.comment.length > 0 ? data.flags.comment : '';

      User.findById(decoded._id, {full_name: true}, (error, user) => {
        if(!user){
          return callback({type: "NotFound"});
        }

        // send mail using SendGrid
        // -------------------- start ------------------------------
        const msg = {
          to: process.env.PFTV_EMAIL,
          from: {
            email: process.env.PFTV_EMAIL,
            name: 'Project Fitness TV'
          },
          // subject: 'Reported Channel',
          // html: "<p>The video " + video.title + ", of the channel " + video.channel_id.title + " </p><p>has been reported by user " + user.full_name + (inappropriate && copyrighted ? ", as " : " ") + inappropriate + "" + copyrighted + " <br/>" + (comment ? "<br/>His message: " + comment : "") + "</p>"
          dynamic_template_data: {
            video_title: video.title,
            channel_title: video.channel_id.title,
            user_name: user.full_name,
            reason: "" + (inappropriate || copyrighted ? ", as " : " ") + inappropriate + "" + copyrighted + "",
            message: "" + (comment ? "<br/>His message: " + comment : "") + ""
          },
          template_id: 'd-34e2f352cc8c447f8b907d8c04c400c3'
        };
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail
          .send(msg)
          .then(() => {
            console.log("report channel to pftv team by");
            console.log(process.env.PFTV_EMAIL);

          }, error => {
            console.error(error);
            if (error.response) {
              console.error(error.response.body)
            }
          callback('email error');
        });
        // --------------- end send mail function -------------------

        video.save(callback);
      })

    })
  }

  // -------------------------------------------
  // Make video inactive instead of deleting it
  // (as Andry recommendation)
  // -------------------------------------------
  setVideoInactive(video_id, decoded, callback) {
    Video.findOneAndUpdate({_id: video_id}, {$set: {active: false}}, function(err, video) {
      if (err) {
        return callback(err);
      }

      // Delete all video link in other documents
      deleteVideoLinks(video_id);
      updateChannelViews(video.channel_id);

      // Subtract channel video count by one
      if(!video.live_status || video.live_status == false) {
        Channel.findById(video.channel_id, {meta: true}, function(channel_error, channel) {
          if (err) {
            return callback(channel_error);
          }

          if(!channel){
            return callback({message: "NotFound"});
          }

          channel.meta.videos = channel.meta.videos > 0 ? channel.meta.videos - 1 : 0;
          channel.save();
        });
      }

      return callback(null, video);
    });
  }

  checkMyUploadedVideoStatus(source_ids, decoded, callback) {
    VimeoLib.checkMyUploadedVideoStatus(source_ids ,function(err, data) {
      if (err){
        return callback(err);
      }

      const request_options = {source_id: {$in: source_ids}, active: true, live_status: false, user_id: decoded._id };
      Video.find(request_options).exec((error, result) => {

        if(error){
          return callback(error);
        }

        let result_mapped = [];

        if (result) {
          result.map(current => {
            result_mapped.push({ source_id: current.source_id, upload_status: current.upload_status, thumbnail: current.thumbnail, duration: current.duration });
          });
        }

        callback(null, result_mapped);
      });
    })
  };

  // lib for live start here ---------------------------------------------------
  getAllLives = (decoded, callback) => {
    Video.find({ active: true, live_status: true, channel_id: {$ne: null} }).exec(callback);
  }

  getLive = (live_id, decoded, callback) => {
    Video
    .findById(live_id)
    .populate('channel_id')
    .populate({
      path: 'categories',
      select: 'title'
    })
    .exec((err, live) => {
      if(err) {
        callback(err);
      }

      callback(null, live);
    });
  }

  getChannelLive(channel_id, decoded, callback) {
    Video.find({
      'channel_id': channel_id,
      'active': true,
      'live_status': true,
      'live_info.status': 'LIVE'
    }).exec((error, data) => {
      if (error) {
        callback(error)
      }
      data = data.length > 0 ? data[0] : {};
      callback(null,data);
    });
  }

  getChannelFutureLive(channel_id, start_week, end_week, decoded, callback) {
    Video.find({
      'channel_id': channel_id,
      'active': true,
      'live_status': true,
      $or: [ {'live_info.status': 'UPCOMMING'}, {'live_info.status': 'LIVE'}],
      'live_info.start': {
        $gte: new Date(start_week),
        $lte: new Date(end_week)
      }
    }).sort({'live_info.start': 1}).exec((error, data) => {
      if (error) {
        callback(error)
      }

      callback(null,data);
    });
  }

  getUserLive(decoded, callback) {
    const request_options = {user_id: decoded._id, active: true, live_status: true};
    Video.find(request_options).sort({created: -1}).exec((err, lives) => {
      callback(null, lives);
    });
  }

  getUserUpcommingAndCurrentLives(decoded, callback) {
    const request_options = {user_id: decoded._id, active: true, live_status: true, $or: [ {'live_info.status': 'UPCOMMING'}, {'live_info.status': 'LIVE'}] };
    Video.find(request_options).sort({created: -1}).exec((err, lives) => {
      callback(null, lives);
    });
  }

  getActualLives = (decoded, callback) => {
    Video.find({
      'active': true,
      'live_status': true,
      'live_info.status': 'LIVE',
      'channel_id': {$ne: null}
    })
    .populate('channel_id', 'title')
    .limit(12)
    .sort({created: -1})
    .exec((error, data) => {
      if (error) {
        callback(error)
      }

      callback(null,data);
    });
  }

  getPopularLives = (decoded, callback) => {
    Video.find({
      'active': true,
      'live_status': true,
      'live_info.status': 'LIVE',
      'channel_id': {$ne: null}
    })
    .populate('channel_id', 'title')
    .sort({'meta.views': -1, 'created': -1})
    .limit(12)
    .exec((error, data) => {
      if (error) {
        callback(error)
      }

      callback(null,data);
    });
  }

  getRecentLives = (start, end, decoded, callback) => {
    Video.find({
      'active': true,
      'live_status': true,
      'live_info.status': 'COMPLETE',
      'channel_id': {$ne: null},
      'live_info.end': {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    })
    .populate('channel_id', 'title')
    .sort({'live_info.end': -1})
    .limit(12)
    .exec((error, data) => {
      if (error) {
        callback(error)
      }

      callback(null,data);
    });
  }

  getUpcommingLives = (start, end, limit = 4, decoded, callback) => {
    Video.find({
      'active': true,
      'live_status': true,
      'live_info.status': 'UPCOMMING',
      'channel_id': {$ne: null},
      'live_info.start': {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    })
    .populate('channel_id', 'title')
    .sort({'live_info.start': 1})
    .limit(Number(limit))
    .exec((error, data) => {
      if (error) {
        callback(error)
      }

      callback(null,data);
    });
  }

  getUserUpcommingLives = (decoded, callback) => {
    Video.find({
      'active': true,
      'live_status': true,
      'live_info.status': 'UPCOMMING',
      'channel_id': {$ne: null},
      user_id: decoded._id
    })
    .populate('channel_id', 'title')
    .sort({'live_info.start': 1})
    .limit(4)
    .exec((error, data) => {
      if (error) {
        callback(error)
      }

      callback(null,data);
    });
  }

  endLiveSession = (live_id, decoded, callback) => {

    Video.findById(live_id, {user_id: true, live_info: true})
    .exec((error, data) => {

      if (error) {
        return callback(error)
      }

      if(!data){
        return callback({message: "NotFound"});
      }

      if(data.user_id.toString() != decoded._id){
        return callback({message: "Forbidden"});
      }

      if(!data.live_info){
        data.live_info = {}
      }

      data.live_info.end = new Date();
      data.live_info.status = "COMPLETE";

      // retrieve video; upload to vimeo, publish to channel

      data.save(callback);
    });
  }

  startLiveSession = (live_id, decoded, callback) => {

    Video.findById(live_id, {user_id: true, live_info: true})
    .exec((error, data) => {

      if (error) {
        return callback(error)
      }

      if(!data){
        return callback({message: "NotFound"});
      }

      if(data.user_id.toString() != decoded._id){
        return callback({message: "Forbidden"});
      }

      if(!data.live_info){
        data.live_info = {}
      }

      data.live_info.status = "LIVE";

      data.save(callback);
    });
  }

  liveReportPlay = (live_id, decoded, callback) => {

    Video.findById(live_id, {user_id: true, viewers: true, meta: true})
    .exec((error, data) => {

      if (error) {
        return callback(error)
      }

      if(!data){
        return callback({message: "NotFound"});
      }

      if(!data.viewers){
        data.viewers = [];
      }

      const user_index = data.viewers.indexOf(decoded._id);

      if(user_index === -1){
        data.viewers.push(decoded._id);
        data.meta.views += 1;

        data.save(callback);
      }
      else callback(null, live_id);

    });
  }

  getSimilarLives(live_id, callback) {
    const TOTAL_VIDEOS = 4;
    Video.findOne({_id: live_id, live_status: true/*, active: true*/}) // active should be commented here so the user who buy the video will able to get similar video even if the coach who upload the video delete it
    .populate('categories')
    .exec(function(err, data){

      if (err){
        return callback(err);
      }

      if(!data){
        return callback({type: "NotFound"});
      }

      // Random Live
      Video.aggregate([{ $match: { "active": true, "live_status": true, "live_info.status": "LIVE" }},{ $sample: { size: TOTAL_VIDEOS }}])
        .exec(function(error, videos){
          if (error){
            return callback(error);
          }

          Channel.populate(videos, {path: 'channel_id', select: 'title'}, function(err, populatedChannelForFronted) {
            return callback(null, videos);
          });
        });

    });
  };

  updateViewers = (video_data, callback) => {

    Video.findById(video_data.live, {"meta": true,"viewers":true}, (error, video) => {

      if(error){
        return callback(error);
      }

      if(!video){
        return callback(null, {message: 'NotFound'});
      }
      
      let viewers_array = video.viewers;
      //console.log(video);
      const user_index = viewers_array.indexOf(video_data.viewers);
      if(user_index === -1){
        viewers_array.push(video_data.viewers);
        //console.log(viewers_array.length);
        video.meta.views = viewers_array.length;
        //console.log(viewers_array);
        video.save((err, saved) => {
         // console.log(saved);
          if (err) {
            callback(err);
          }
          Video.findById(video_data.live, {"meta": true,"viewers":true}, (error, video) => {
          //  console.log(video);
          });
          callback(null, saved);
        });
      }
    });
    
  };

  // ---------------------------------------------------------------------------------
  // New live twilio update
  // ---------------------------------------------------------------------------------
  checkRoom = async (roomName, callback) => {
    try {
      Video.findOne({
        "live_info.roomName": roomName
      }).exec(function(err, data){
              return callback(null, { status: data.live_info.status });
      });
      // await TWILIO_CLIENT.video.rooms.get(roomName).fetch().then(
      //   room => {
      //     console.log(room);
      //     return callback(null, { status: room.status });
      //   });

    } catch(e) {
      return callback(null, { status : "unavailable"})
    }
  }

  createRoom = async (roomName,maxNoPeople, callback) => {
    try {
      await TWILIO_CLIENT.video.rooms.create({uniqueName: roomName,maxParticipants:maxNoPeople}).then(room => {
        return callback(null, { roomName: room.uniqueName });
      });
      } catch (error) {
      console.log(error);
    }
  }

  getConnectedUser = async (decoded, roomName, callback) => {
    Video.find({"live_info.roomName":roomName }).exec(async function(err, video){
      console.log(video[0].puchased_by_user);
      if(video[0].price > 0){
        if(video[0].user_id._id.toString() && decoded._id != video[0].user_id._id){
          let user_already_purchased = video[0].puchased_by_user;
          const user_index = user_already_purchased.indexOf(decoded._id);
          if(user_index === -1){
            return callback(null, { connected_users: video[0].puchased_by_user.length + 1 });
          }else{
            return callback(null, { connected_users: 0 });
          }
        }else{
          return callback(null, { connected_users: 0 });
        }
      }else{
      if(video[0].live_info.status == 'LIVE'){
         const connected_users = [];
           await TWILIO_CLIENT.video.rooms(roomName).participants.list({status: 'connected', limit: 50}).then(participants => 
            participants.forEach(p => connected_users.push(p.sid))
          );
         // console.log(connected_users);
          try {
            await TWILIO_CLIENT.video.rooms(roomName).participants(decoded._id).fetch().then(participant => {
              if(participant.sid && connected_users.includes(participant.sid)){
                const index = connected_users.indexOf(participant.sid);
                if (index > -1) { // only splice array when item is found
                  connected_users.splice(index, 1); // 2nd parameter means remove one item only
                }
              }
            });
          } catch (error) {
            //console.log(error);
          }
          let count_user = connected_users.length;
          //console.log(count_user);
          try {
            Video.findOne({
              "live_info.roomName": roomName
            }).exec(async function(err, data){
              if(data.user_id._id.toString() && decoded._id != data.user_id._id){
               count_user = count_user + 1;
                try {
                    await TWILIO_CLIENT.video.rooms(roomName).participants(data.user_id._id.toString()).fetch().then(participant => {
                     count_user = count_user - 1;
                     return callback(null, { connected_users: count_user });
                    });
                } catch (error) {
                 
                }
              }
          return callback(null, { connected_users: count_user });
          });

        } catch(e) {
          console.log(e);
        }
      }else{
            let connected_array = video[0].connected_user;
            if(video[0].user_id._id.toString() && decoded._id != video[0].user_id._id){
              const user_index = connected_array.indexOf(decoded._id);
                  if(user_index === -1){
                    if(video[0].live_info.maxNoPeople > connected_array.length + 1){
                      connected_array.push(decoded._id);
                      video[0].connected_array = connected_array;
                      video[0].save((err, saved) => {
                        if (err) {
                          callback(err);
                        }
                      });
                      return callback(null, { connected_users: connected_array.length});
                    }else{
                      return callback(null, { connected_users: connected_array.length + 1});
                    }
                    
                  }else{
                    return callback(null, { connected_users: connected_array.length });
                  }
              
            }else{
              return callback(null, { connected_users: 0 });
            }
     }
   }
    });
      
   
      
  }
  generateToken = async (decoded, roomName, callback) => {
    User.findById(decoded._id, {full_name: true}).exec((err, user) => {
      // Create Video Grant
      const videoGrant = new VideoGrant({
        room: roomName
      });

      // Create an access token which we will sign and return to the User,
      // containing the grant we just created
      const token = new AccessToken(
        TWILIO_ACCOUNT_SID,
        TWILIO_API_KEY,
        TWILIO_API_SECRET,
        {identity: user._id.toString()}
      );
      token.addGrant(videoGrant);
      // Serialize the token to a JWT string
      callback(null, {roomToken: token.toJwt(), roomName: roomName });
    });
  }
  // lib for live end here ---------------------------------------------------

}
  const updateChannelViews = function(channel_id){

    Channel.findById(channel_id, (error, channel) => {

      if(error){
        return -1;
      }

      if(!channel){
        return -1;
      }

      Video.find({ channel_id: channel._id, active: true, live_status: false, upload_status: "COMPLETE"}, {meta: true}, (error, videos) => {

        if(error){
          return -1;
        }

        channel.meta.views = videos.reduce((result, current) => result + current.meta.views, 0);

        channel.save((error, saved_channel) => {
          if(error){
            return -1;
          }
        });
      })
    })
  }

  // -----------------------------------------------------------
  // Delete all video link in other documents
  // -----------------------------------------------------------
  const deleteVideoLinks = function(video_id) {

    Comment.updateMany({video_id: video_id}, {$set: {video_id: null}}, function(error, data) {
      if (error){
        console.log(error);
      }

    });

    Payment.updateMany({video: video_id}, {$set: {video: null}}, function(error, data) {
      if (error){
        console.log(error);
      }

    });

    Playlist.updateMany({ $pull: { "videos": { "$in": [ video_id ] } } }, function(error, data) {
      if (error){
        console.log(error);
      }

    });

    Channel.updateMany({ $pull: { "featured_videos": { "$in": [ video_id ] } } }, function(error, data) {
      if (error){
        console.log(error);
      }

    });

    User.updateMany(
      {
        $pull: {
          "favorite_videos": { "$in": [ video_id ] },
          "liked_videos": { "$in": [ video_id ] },
          "disliked_videos": { "$in": [ video_id ] },
          "videos_history": { "$in": [ video_id ] },
          "watch_later_videos": { "$in": [ video_id ] },
          "recommendations": { "$in": [ video_id ] },
          "report_history": { "video": video_id },
          "continue_watching_videos": { "video": video_id }
        }
      }, function(error, data) {
        if (error){
          console.log(error);
        }

    });

  }

module.exports = VideoLib;
