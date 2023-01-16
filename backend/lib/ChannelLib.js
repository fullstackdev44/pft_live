'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const isValidId = ObjectId.isValid;

const CommonLib = require('../component/lib');
const ToolLib = require('./ToolLib');

const Channel = require('../models/Channel');
const User = require('../models/User');
const Event = require('../models/Event');
const Video = require('../models/Video');

const sgMail = require('@sendgrid/mail');

// configurations
const trendingDaysRange = 7;

class ChannelLib extends CommonLib{

  constructor(){
    super(Channel);
  }

  getMyChannels(decoded, callback){
    Channel.find({owner: decoded._id, active: true}, callback);
  }

  getPopulars(decoded, callback) {
    Channel.find({active: true}).sort({ 'meta.subscribers': -1 }).limit(6).exec(callback);
  };

  getPopularsWithSkipOption(skip_option, limit_option, decoded, callback) {
    Channel.find({active: true}).sort({ 'meta.subscribers': -1 }).skip(Number(skip_option)).limit(Number(limit_option)).exec(callback);
  };

  getTrendings(decoded, callback) {
    // Channel.find().sort({ 'views_number': -1 }).limit(6).exec(callback);
    Event.find({object: "CHANNEL", type: "VIEW"})
    .sort({"created": -1})
    .exec((error, events) => {

      if(error){
        return callback(error);
      }

      let channel_ids = events.map(current => current.ref);
      let aggregated_channels = channel_ids.reduce((result, current) => {

        if(result[current]){
          result[current] += 1;
        }
        else{
          result[current] = 1;
        }

      }, []);

      aggregated_channels = aggregated_channels.sort().splice(0, 10);

      Channel.find({_id: {$in: channel_ids}, active: true})
      .sort()
      .exec(callback)
    })
  };

  getTrendingsWithSkipOption(skip_option, limit_option, decoded, callback) {

    let lastWeekDay = new Date();
    lastWeekDay.setDate(lastWeekDay.getDate() - trendingDaysRange);
    
    // Channel.find().sort({ 'views_number': -1 }).skip(Number(skip_option)).limit(Number(limit_option)).exec(callback);
    Event.find({object: "CHANNEL", type: "VIEW", created: {$gte: lastWeekDay}})
    // .sort({"created": -1})
    .exec((error, events) => {

      if(error){
        return callback(error);
      }

      let channel_ids = events.map(current => current.ref);

      let aggregated_channels = channel_ids.reduce((result, current) => {

        if(result[current]){
          result[current] += 1;
        }
        else{
          result[current] = 1;
        }

        return result;

      }, []);

      let items = Object.keys(aggregated_channels).map(key => [key, aggregated_channels[key]]);
      items.sort((a, b) => b[1] - a[1]);

      const skip_index = Number(skip_option) * Number(limit_option);
      channel_ids = items.map(current => current[0]).slice(skip_index, skip_index + Number(limit_option));

      Channel.find({_id: {$in: channel_ids}, active: true})
        // .sort()
        .exec((error, channels) => {

          if(error){
            return callback(error);
          }

          channels.sort((a, b) => aggregated_channels[b._id.toString()] - aggregated_channels[a._id.toString()]);

          if(channels.length < limit_option){

            Channel.find({_id: {$nin: channel_ids}, active: true})
            .sort({"meta.views": -1})
            .limit(Number(limit_option - channels.length))
            .exec((error, mostViewedChannels) => {

              if(error){
                return callback(error);
              }

              // load another data if ever mostViewedChannels is void
              // just to make sure we are always returning data to viewer (Eldad claim that sometimes trending is void)
              if(mostViewedChannels.length == 0){
                Channel.find({active: true})
                  .sort({"meta.views": -1})
                  .limit(Number(limit_option - channels.length))
                  .exec((error, mostViewedChannels_default_data) => {

                    if(error){
                      return callback(error);
                    }

                    callback(null, channels.concat(mostViewedChannels_default_data));
                })
              } else {
                callback(null, channels.concat(mostViewedChannels));
              }
            })
          }
          else{
            callback(null, channels);
          }
        })
    })
  };

  getFeatured(id, decoded, callback){
    Channel.findById(id)
    .populate("featured_channels")
    .exec((error, data) => {

      if(!data){
        return callback({type: 'NotFound'});
      }

      callback(error, data.featured_channels);
    })
  }

  getRecents(decoded, callback) {
    Channel.find({active: true}).sort({ 'created': -1 }).limit(8).exec(callback);
  };

  getRecentsWithSkipOption(skip_option, limit_option, decoded, callback) {
    Channel.find({active: true}).sort({ 'created': -1 }).skip(Number(skip_option)).limit(Number(limit_option)).exec(callback);
  };

  createFromUser(user_data, callback) {

    const new_channel = new Channel();

    new_channel.owner = user_data._id;
    new_channel.title = user_data.full_name;
    new_channel.unique_id = ToolLib.generateUniqueId(new_channel.title);
    new_channel.avatar_color = user_data.avatar_color;
    new_channel.avatar_card = user_data.avatar_card;
    new_channel.active = true;

    Channel.find({ unique_id: new_channel.unique_id })
    .exec((error, data) => {
      console.log(new_channel);
      if(data){
        new_channel.unique_id = ToolLib.generateUniqueId(new_channel.title + '_' + new Date());
      }

      new_channel.save(callback);
    });
  };

  detail = (id, decoded, callback) => {
    isValidId(id) ? Channel.findById(id, callback) : Channel.findOne({unique_id: id, active: true}, callback);
  }

  // reportView(channel_data, decoded, callback){
  //   Channel.findById(channel_data._id, {profile_image: false}, (error, channel) => {

  //     if(error){
  //       return callback(error);
  //     }

  //     if(!channel){
  //       return callback({message: "NotFound"});
  //     }

  //     if(!channel.viewers){
  //       channel.viewers = [];
  //     }

  //     const viewer_index = channel.viewers.map(current => current.toString()).indexOf(decoded._id);

  //     if(viewer_index === -1){
  //       channel.viewers.push(decoded._id);
  //       channel.meta.views += 1;
  //     }

  //     let new_event = new Event();
  //     new_event.user = decoded._id;
  //     new_event.type = "VIEW"
  //     new_event.object = "CHANNEL";
  //     new_event.ref = channel._id;

  //     new_event.save();

  //     channel.save(callback);
  //   })
  // }

  update = (channel_data, channel, decoded, callback) => {

      if(channel_data.title){
        channel_data.unique_id = ToolLib.generateUniqueId(channel_data.title);
      }

      if(!channel.owner || !(channel.owner.toString() == decoded._id.toString())) {
        return callback({type: 'Unauthorized'});
      }

      super.update(channel_data, channel, decoded, callback);
  };

  getChannelByCategory(category_id, decoded, callback) {
    Channel.find({ 'categories': { $in: category_id }, active: true }).exec(callback);
  };

  filterByCategories(category_ids, decoded, callback) {
    if (category_ids.length) {
      Channel.find({ 'categories': { $all: category_ids }, active: true }).exec(callback);
    } else {
      Channel.find({active: true}).limit(30).exec(callback);
    }
  }

  addSubscriber(channel, decoded, callback){

    channel.meta.subscribers += 1;
    channel.subscribers.push(decoded._id);

    channel.save(callback);
  }

  removeSubscriber(channel, decoded, callback){

    channel.meta.subscribers -= 1;

    const subscriber_index = channel.subscribers.indexOf(decoded._id);
    if(subscriber_index > -1){
      channel.subscribers.splice(subscriber_index, 1);
    }
    channel.save(callback);
  }

  addFeaturedVideo(data, decoded, callback){

    Channel.findById(data.channel, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      if(channel.owner != decoded._id){
        return callback({type: "Forbidden"});
      }

      const video_index = channel.featured_videos.indexOf(mongoose.Types.ObjectId(data.video));

      if(video_index == -1){

        if(channel.featured_videos.length >= 2){
          channel.featured_videos.shift();
        }

        channel.featured_videos.push(data.video);
        channel.save(callback);
      }
      else{
        callback(null, true);
      }
    })
  }

  removeFeaturedVideo(data, decoded, callback){

    Channel.findById(data.channel, {owner: true, featured_videos: true}, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      if(channel.owner != decoded._id){
        return callback({type: "Forbidde"});
      }

      const video_index = channel.featured_videos.indexOf(mongoose.Types.ObjectId(data.video));

      if(video_index > -1){
        channel.featured_videos.splice(video_index, 1);
        channel.save(callback);
      }
      else{
        callback(null, true);
      }
    })
  }

  addFeaturedChannel(data, decoded, callback){

    Channel.findById(data.channel, {owner: true, featured_channels: true}, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      if(channel.owner != decoded._id){
        return callback({type: "Forbidden"});
      }

      const feature_index = channel.featured_channels.indexOf(mongoose.Types.ObjectId(data.feature_channel));

      if(feature_index == -1){

        channel.featured_channels.push(data.feature_channel);
        channel.save(callback);
      }
      else{
        callback(null, true);
      }
    })
  }

  removeFeaturedChannel(data, decoded, callback){

    Channel.findById(data.channel, {owner: true, featured_channels: true}, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      if(channel.owner != decoded._id){
        return callback({type: "Forbidden"});
      }

      const feature_index = channel.featured_channels.indexOf(mongoose.Types.ObjectId(data.feature_channel));

      if(feature_index > -1){
        channel.featured_channels.splice(feature_index, 1);
        channel.save(callback);
      }
      else{
        callback(null, true);
      }
    })
  }

  getSubscribed(decoded, callback){

    User.findById(decoded._id, {subscribed_channels: true})
    .populate("subscribed_channels.channel")
    .exec((error, user) => {

      if(error){
        return callback({type: "InternalError"});
      }

      if(!user){
        return callback({type: "NotFound"});
      }

      callback(null, user.subscribed_channels.map(current => current.channel));
    })
  }

  flag(data, decoded, callback) {

    Channel.findById(data.channel, {flags: true, title: true}, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      if(!channel.flags){
        channel.flags = [];
      }

      data.flags.user = decoded._id;
      channel.flags.push(data.flags);

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
          // html: "<p>The channel " + channel.title + ",</p><p>has been reported by user " + user.full_name + (inappropriate && copyrighted ? ", as " : " ") + inappropriate + "" + copyrighted + " <br/>" + (comment ? "<br/>His message: " + comment : "") + "</p>"
          dynamic_template_data: {
            channel_title: channel.title,
            user_name: user.full_name,
            reason: "" + (inappropriate || copyrighted ? ", as " : " ") + inappropriate + "" + copyrighted + "",
            message: "" + (comment ? "<br/>His message: " + comment : "") + ""
          },
          template_id: 'd-7dc7e0af8a7e4361be00160abaae01b3'
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

        channel.save(callback);
      })

    })
  }

  videoCount(id, decoded, callback){

    Video.find({ channel_id: id, active: true, live_status: false, upload_status: "COMPLETE"}, {meta: true}, (error, videos) => {

      if(error){
        callback(error)
      }

      const count = videos.length;
      const views = videos.reduce((result, current) => result + current.meta.views, 0);

      callback(null, {count, views});
    })
  }

  updateVideoCount(data, decoded, callback){
    Channel.findById(data._id, {meta: true}, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      channel.meta = data.meta;

      channel.save(callback);
    })
  }

  checkChannelOfUser(user_id, decoded, callback){
    // desactivate 'active' field filter to avoid error of deleted/desactivated channel by Eldad/PFTV team
    // and to make sure user who is not COACH can be handled too
    // This will caused a bug if 'acitve' field filter is active
    Channel.find({owner: user_id, /*active: true*/}, {_id: true})
      .exec((error, data) => {

        if(!data){
          return callback({type: 'NotFound'});
        }

      callback(null, data && data[0] && data[0]._id ? data[0]._id : null);
    })
  }

  updateTitle(data, decoded, callback){
    Channel.findById(data._id, {title: true, avatar_card: true}, (error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel){
        return callback({type: "NotFound"});
      }

      channel.title = data.title;
      channel.avatar_card = ToolLib.generateCard({full_name: data.title});

      channel.save((err, saved) => {
        if (err) {
          callback(err);
        }

        callback(null, saved.avatar_card);
      });
    })
  }

}

module.exports = ChannelLib;
