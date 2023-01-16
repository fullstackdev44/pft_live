'use strict';

const CommonLib = require('../component/lib');

const User    = require('../models/User');
const Channel = require('../models/Channel');
const Event = require('../models/Event');
const Video = require('../models/Video');

const ToolLib = require('./ToolLib');
const nodemailer = require('nodemailer');
const AuthLib = require('../lib/AuthLib');

const sgMail = require('@sendgrid/mail');

const async = require('async');

const maxWatchLaterLength = 8;

class UserLib extends CommonLib{

  constructor(){
    super(User);
  }

  create = (user_data, decoded, callback) => {

    user_data.avatar_color = ToolLib.generateColor();
    user_data.avatar_card = ToolLib.generateCard(user_data);

    this._create(user_data, decoded, callback);
  }

  updateUser = (data, decoded, callback) => {

    User.findById(data._id, '-__v -password').exec((err, user) => {

      delete data._id;

      delete data.account_type; // For security reason to prevent user for modifing request and update themselves to a COACH (as backoffice is not yet available) // So only Eldad can do it for now from database

      // limit watch_later videos
      if(data.watch_later_videos){
        if(data.watch_later_videos.length > 8){
          data.watch_later_videos = data.watch_later_videos.slice(data.watch_later_videos.length - maxWatchLaterLength, data.watch_later_videos.length);
        }
      }

      for (const key in data) {
        if ({}.hasOwnProperty.call(data, key)) {
          user[key] = data[key];
        }
      }

      user.save(callback);
    });
  }

  detailPopulate(id, decoded, callback) {

    User.findById(id, '-__v -password').populate(
      {
        path: 'watch_later_videos',
        populate: {path: 'channel_id'}
      }
    ).populate(
      {
        path: 'favorite_videos',
        populate: {path: 'channel_id'}
      }
    ).populate(
      {
        path: 'liked_videos',
        populate: {path: 'channel_id'}
      }
    )
    .populate(
      {
        path: 'disliked_videos',
        populate: {path: 'channel_id'}
      }
    ).populate(
      {
        path: 'videos_history',
        populate: {path: 'channel_id'}
      }
    )
    .populate(
      {
        path: 'report_history.video',
        populate: {path: 'channel_id', select: 'title'}
      }
    )
    .populate('playlists')
    .populate('purchased_videos')
    .populate('contacts')
    .populate('blocked_users.user')
    .populate('subscribed_channels.channel')
    .exec(callback);
  };

  getUserPassword(decoded, callback) {
    User.findById(decoded._id, {password :true}).exec(callback);
  };

  getByChannel(channel_id, decoded, callback){

    Channel.findById(channel_id, {owner: true, title: true})
    .exec((error, channel) => {

      if(error){
        return callback(error);
      }

      if(!channel || !channel.owner){
        return callback({type: 'NotFound', message: 'User not found'});
      }

      User.findById(channel.owner, {username: true})
      .exec((error, user) => {

        if(error){
          return callback(error);
        }

        if(!user){
          return callback({type: 'NotFound', message: 'User not found'})
        }

        user.set("channel", channel.title, {strict: false});

        return callback(null, user);
      });
    })
  }

  // waiting new Andry function to get/set populate options for backend data
  detailNoPopulate(id, decoded, callback) {
    User.findById(id, '-__v -password').exec(callback);
  };

  detail = (id, decoded, callback) => {
    User.findById(id, '-__v -password').exec(callback);
  };

  _detail(decoded, callback) {
    User.findById(decoded._id, '-__v -password').exec(callback);
  };

  searchHistory(decoded, callback){
    User.findById(decoded._id, '-__v -password').exec((error, user) => {

      if(error){
        return callback(error);
      }

      callback(error, user.search_terms_history);
    })
  }

  // TODO: test this further and only take
  // the necessary fields
  signup(user_data, callback) {
    //user_data.username = user_data.username.toLowerCase().trim();
    //user_data.username = user_data.full_name ? user_data.full_name : '';
    user_data.email = user_data.email.toLowerCase().trim();

    // User.find({ $or:[ {email: user_data.email}, {username: user_data.username}] }, '-__v -password').exec((error, user) => {
    User.find({ email: user_data.email }, '-__v -password').exec((error, user) => {
      if(error) {
        return callback(error);
      }

      if(user.length >0) {
        if(user[0].email && user[0].email == user_data.email) {
          return callback('email already exist!');
        /*} else if(user[0].username && user[0].username == user_data.username) {
          return callback('username already exist!');*/
        } else {
          return callback('email or username already exist!');
        }
      }

      const new_user = new User();

      for (const key in user_data) {
        if ({}.hasOwnProperty.call(user_data, key)) {
          new_user[key] = user_data[key];
        }
      }
      new_user.active = true;
      // Set notification default value,
      // we can add more like new recommended_video,
      // new popular video, etc... if we have an algorithm for it
      new_user.notifications.push({
        name: 'SUBSCRIPTION',
        status: true
      });
      new_user.notifications.push({
        name: 'COMMENT',
        status: true
      });
      // This doesn't works for now so I comment it out
      /*new_user.notifications.push({
        name: 'Mentions',
        status: true
      });*/
      new_user.notifications.push({
        name: 'DONATION',
        status: true
      });

      new_user.avatar_color = ToolLib.generateColor();
      new_user.avatar_card = ToolLib.generateCard(new_user);

      let token = AuthLib.generateEmailValidationToken(new_user.email);
      // must be changed to production server url
      let url = process.env.HOST_DOMAIN_URL + '/activate-account/' + token;

      const msg = {
        to: new_user.email,
        from: {
          email: process.env.PFTV_EMAIL,
          name: 'Project Fitness TV'
        },
        dynamic_template_data: {
          full_name: new_user.full_name,
          url_link: url
        },
        template_id: 'd-5f893686fc1e47be99741f5ece256d48'
      };
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      sgMail
        .send(msg)
        .then(() => {
          console.log("verification mail sent to:");
          //console.log(new_user.email);
          new_user.save(callback);
        }, error => {
          console.error(error);
          if (error.response) {
            console.error(error.response.body)
          }
          callback('email error');
        });

    })
  };

  findUserFromSocialNetwork(body, callback) {
    const request_options = {};
    if (body.facebook_id) {
      request_options.facebook_id = body.facebook_id;
    } else if(body.twitter_id) {
      request_options.twitter_id = body.twitter_id;
    }
    User.findOne(request_options, '-__v -password', callback);
  };

  login(body, callback) {

    /*const credential = body.login.trim().replace(/\s/g, '');
    //console.log("Inside log in ....");

    const request_options = {
      $or: [
        {username: credential},
        {email: credential.toLowerCase()}
      ]
    };*/

    const request_options = { email: body.email.toLowerCase().trim(), active: true }

    // User.findOne(request_options, field_options, callback);
    User.findOne(request_options, (error, user) => {

      if(!user){
        error = {type: "InvalidCredential", message: "Invalid email or password"};
        console.log("--------- LOGIN ERROR --------------");
        console.log(error);
        console.log("--------- LOGIN ERROR --------------");
      }

      return callback(error, user);
    });
  };

  getSubscriptions(decoded, callback){
    User.findById(decoded._id, '-__v -password')
    .populate('subscribed_channels.channel')
    .exec(function (error, user) {

      if (!user || !user.subscribed_channels){
        return callback(error, []);
      }

      return callback(error, user.subscribed_channels.map(current => current.channel));
    });
  }
  subscriptionsbyid(user_id, channel_id, decoded, callback){
    User.findById(user_id)
    .exec((error, user) => {
      if (!user || !user.subscribed_channels){
        return callback(error, []);
      }
      var response = false;
      //console.log(channel_id);
      var convertedarray = user.subscribed_channels.map(o=>[o.channel]);
      for (var i = 0; i < convertedarray.length; ++i) {
        if(channel_id == convertedarray[i].toString()){
          response = true;
        }
      }
        return callback(error, {message: response});
      
    });
  }

  subscribe(channel_id, user, callback){

    // don't add the subscription if the user is already subscribed
    let mapped_subscriptions = [];
    if(user.subscribed_channels && user.subscribed_channels.length > 0) {
      mapped_subscriptions = user.subscribed_channels.map(current => current.channel);
    }
    const subscription_index = mapped_subscriptions.indexOf(channel_id);

    if(subscription_index > -1){
      return callback();
    }

    // Add channel owner to user contact
    Channel.findById({_id: channel_id}, {owner: true}, (error, channel_data) => {

      if(error){
        return callback(error);
      }

      if(!channel_data || channel_data.length == 0){
        return callback(null, {message: "NotFound"});
      }

      user.contacts.push(channel_data.owner);
      user.subscribed_channels.push({channel: channel_id, date: new Date()});
      user.save(callback);
    })
  }

  unsubscribe(channel_id, user, callback){
    let mapped_subscriptions = [];
    if(user.subscribed_channels && user.subscribed_channels.length > 0) {
      mapped_subscriptions = user.subscribed_channels.map(current => current.channel);
    }
    const subscription_index = mapped_subscriptions.indexOf(channel_id);
    var subscription_indexnew = -1;
   // console.log(user.subscribed_channels.map(current => current.channel));
   // const subscription_index = user.subscribed_channels.map(current => current.channel).indexOf(channel_id);
    for (var i = 0; i < mapped_subscriptions.length; ++i) {
        var  subscribedChannel = mapped_subscriptions[i];
       if(channel_id == subscribedChannel){
         subscription_indexnew = i;
       }
    }
    if(subscription_indexnew < 0){
      return callback();
    }

    // Remove channel owner to user contact
    Channel.findById({_id: channel_id}, (error, channel_data) => {
      if(error){
        return callback(error);
      }

      if(!channel_data || channel_data.length == 0){
        //console.log('okkk')
        return callback(null, {message: "NotFound"});
      }
      //console.log(channel_data);
      const contact_index = user.contacts.indexOf(channel_data.owner);

      if(contact_index > -1){
        user.contacts.splice(contact_index, 1);
      }

      user.subscribed_channels.splice(subscription_index, 1);
      user.save(callback);
    })

    // if the channel is featured in the user channels, remove it
    Channel.find({owner: user, active: true}, {featured_channels: true}, (error, channels) => {

      if(error){
        return callback(error);
      }

      if(!channels || channels.length == 0){
       // console.log('okkkkk');
        return callback(null, {message: "NotFound"});
      }

      channels.forEach(channel => {

        const featured_index = channel.featured_channels.map(current => current.toString()).indexOf(channel_id);

        if(featured_index > -1){
          channel.featured_channels.splice(featured_index, 1);
          channel.save();
        }
      })
    })
  }

  addToFavorite(video_id, user, callback){

    const video_index = user.favorite_videos.indexOf(video_id);

    if(video_index > -1){
      return callback();
    }

    user.favorite_videos.unshift(video_id);
    user.save(callback);
  }

  removeFromFavorite(video_id, user, callback){

    const video_index = user.favorite_videos.indexOf(video_id);

    if(video_index < 0){
      return callback(null, {_id: user._id});
    }

    user.favorite_videos.splice(video_index, 1);
    user.save(callback);
  }

  addToWatchLater(video_id, user, callback){

    if(!user.watch_later_videos){
      user.watch_later_videos = [];
    }

    const video_index = user.watch_later_videos.indexOf(video_id);

    if(video_index > -1){
      return callback(null, {_id: user._id});
    }

    user.watch_later_videos.push(video_id);

    // limit watch_later videos
    if(user.watch_later_videos.length > 8){
      user.watch_later_videos = user.watch_later_videos.slice(user.watch_later_videos.length - maxWatchLaterLength, user.watch_later_videos.length);
    }

    user.save(callback);
  }

  removeFromWatchLater(video_id, user, callback){

    const video_index = user.watch_later_videos.indexOf(video_id);

    if(video_index < 0){
      return callback();
    }

    user.watch_later_videos.splice(video_index, 1);
    user.save(callback);
  }

  forgotPassword(body, callback) {

    const request_options = {
      email: body.email.toLowerCase().trim()
    };

    User.findOne(request_options, '-__v -password', (error, user) => {

      if(!user){
        error = {type: "NotFound", message: "This email doesn't exist on our database"};
        return callback(error);
      } else {

        let token = AuthLib.generateForgotPasswordToken(user);
        // must be changed to production server url
        let url = process.env.HOST_DOMAIN_URL + '/reset-password/' + token;

        // send mail using SendGrid
        // -------------------- start ------------------------------
        const msg = {
          to: user.email,
          from: {
            email: process.env.PFTV_EMAIL,
            name: 'Project Fitness TV'
          },
          dynamic_template_data: {
            full_name: user.full_name,
            url_link: url
          },
          template_id: 'd-5e1b7b35fd61406a95965b27fe3e763d'
        };
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail
          .send(msg)
          .then(() => {
            console.log("reset password mail sent to:");
            console.log(user.email);

          }, error => {
            console.error(error);
            if (error.response) {
              console.error(error.response.body)
            }
          callback('email error');
        });
        // --------------- end send mail function -------------------

        return callback(error, user);
      }
    });

  };

  resetPassword(body, callback) {
    User.findOne({_id: body._id}, '-__v -password').exec(function(error, user) {
      user.password = body.password;
      user.save(callback);
    });
  };

  activateAccount(body, callback) {
    User.findOne({email: body.email}, '-__v -password').exec(function(error, user) {
      if (user) {
        user.active = true;
        user.save(callback);
        /*
        Channel.findOne({owner: user._id, active: false}, {active: true})
          .exec((error, channel) => {

            if(!channel){
              return callback({type: 'NotFound'});
            }

            channel.active = true;
            channel.save();
            user.save(callback);
        })
        */
      } else {
        callback('error user not found!')
      }
    });
  };

  channelRecentDonators(channel_id, decoded, callback){

    return callback(null, []);
  }

  notificationsConfig(decoded, callback){
    User.findById(decoded._id).exec((error, user) => {

      if(error){
        return callback(error);
      }

      callback(error, user.notifications);
    })
  }

  getUpdatesFromSubscription(user, decoded, callback) {

    let subscribed_channel_ids = user.subscribed_channels.map(current => current.channel.toString());

    Event.find({type: "CREATION", object: "VIDEO", groupRef: {$in: subscribed_channel_ids}})
    .sort({created: -1})
    .limit(4)
    .exec((error, events) => {

      // console.log(events);

      if(error){
        return callback(error);
      }

      let video_ids = events.map(current => current.ref);

      Video.find({_id: {$in: video_ids}, active: true, upload_status: "COMPLETE", live_status: false})
      .populate('channel_id','title avatar_card avatar_color')
      .sort({created: -1})
      .exec((error, videos) => {

        // console.log(videos);

        callback(error, videos);

      });
    })
  }

  getUpdatesFromSubscriptionsDetails = async (user, decoded, page, page_size, callback) => {

    const page_index = Number(page) * Number(page_size);

    let subscribed_channel_ids = user.subscribed_channels.map(current => current.channel.toString());
    let results = [];

    let channels = await new Promise((resolve, reject) => Channel.find({_id: {$in: subscribed_channel_ids}/*, "meta.videos": {$gt: 0}, active: true*/}, {title: true, avatar_card: true, avatar_color: true, active: true}, (error, channels) => resolve(channels)));
    // channels = channels.slice(page_index, page_index + Number(page_size));     // moved it to fronted (as we need all the channels results to sort it by last_update)
    const channels_indexes = channels.map(current => current._id.toString());

    async.each(subscribed_channel_ids, (current_channel, async_callback) => {

      Event.find({type: "CREATION", object: "VIDEO", groupRef: current_channel, $or: [ {'hidden': {$exists : false} }, {'hidden': false} ] }) // show only new event who is not hidden or hidden field doesn't exist yet
      .sort({created: -1})
      .limit(4)
      .exec((error, events) => {

        if(error){
          return async_callback(error);
        }

        if(events.length){

          const last_update = events[0].created;
          const video_ids = events.map(current => current.ref);

          Video.find({_id: {$in: video_ids}, live_status: false, active: true}, (error, videos) => {

            if(error){
              return async_callback(error);
            }

            results.push({
              channel: channels[channels_indexes.indexOf(current_channel)],
              last_update,
              videos
            })

            async_callback();
          })
        }
        else{
          async_callback();
        }
      })
    },
    error => {

      if(error){
        return callback(error);
      }

      results = results.sort(function(a, b){return b.last_update - a.last_update});

      callback(null, results);
    })

    // Event.find({type: "CREATION", object: "VIDEO", groupRef: {$in: subscribed_channel_ids}})
    // .limit(0)
    // .exec((error, events) => {

    //   if(error){
    //     return callback(error);
    //   }

    //   let video_ids = events.map(current => current.ref);

    //   Video.find({_id: {$in: video_ids}, active: true, live_status: false, upload_status: "COMPLETE"})
    //   .populate('channel_id','title avatar_card avatar_color')
    //   .sort({created: -1})
    //   .exec(callback);
    // })
  }

  removeFromUpdatesFromSubscriptions(channel_id, callback) {

    Event.updateMany({type: "CREATION", object: "VIDEO", groupRef: channel_id}, {$set: {hidden: true}}, function(error, data) {
      if (error){
        return callback(error);
      }

      callback(error, 'done');
    });
  }

  // ---------------------------------------
  // Get oldest paused videos
  // Queue index: 0(oldest) .... N(newest)
  // ---------------------------------------
  lastPausedVideo(decoded, callback) {

    User.findById(decoded._id, {continue_watching_videos: true})
    .populate("continue_watching_videos.video")
    .exec((error, user) => {

      if(error){
        return callback(error);
      }

      let last_paused_video = null;
      if(user && user.continue_watching_videos && user.continue_watching_videos.length > 0){

        last_paused_video = user.continue_watching_videos[user.continue_watching_videos.length - 1];
      }

      return callback(null, last_paused_video || {});
    })
  }

  myChannels(decoded, callback) {
    Channel.find({ 'owner': decoded._id, active: true }).exec(callback);
  }

  _getRecommendedVideo(user, decoded, callback) {

    let videos_history_list = user.videos_history.reverse().slice(0, 8);
    let recommended_videos = [];

    async.each(videos_history_list, (video, async_callback) => {

      // In progress (Search Video with same category)
      Video.find({ active: true, live_status: false, upload_status: "COMPLETE", channel_id: {$ne: null} /*$or:[ {categories: video.categories}, {tags: video.tags}]*/})
      .populate('channel_id','title avatar_card avatar_color')
      .exec(function(error, videos) {

        if (error) {
          return async_callback(error);
        }

        recommended_videos.push(videos[0]);
        async_callback();
      });
    },
    (error) => {
        callback(error, recommended_videos);
    })

  }

  // ----------------------------------------
  // Get next videos on user's list to watch
  // only watch later videos are
  // included
  // ----------------------------------------
  watchLater(page, decoded, callback) {

    User.findById(decoded._id, {watch_later_videos: true, paused_video: true, paused_time: true})
    .populate({path: "watch_later_videos", populate: "channel_id"})
    // .populate({path: "paused_video", populate: "channel_id"})
    // .skip(page * 8).limit(8)
    .exec((error, user) => {

      if(error){
        return callback(error);
      }

      // if(user.paused_video){
      //   user.paused_video.current_time = user.paused_time;
      //   user.watch_later_videos.push(JSON.parse(JSON.stringify(user.paused_video)));
      // }

      const paged_data = user.watch_later_videos.slice(page * 8, (page * 8) + 8);

      return callback(null, paged_data);
    })
  }

  // ----------------------------------------
  // Get paused or not terminated videos in user profile
  // only continueWatching videos are
  // included
  // ----------------------------------------
  continueWatching(page, decoded, callback) {

    User.findById(decoded._id, {continue_watching_videos: true})
      .populate({
        path: 'continue_watching_videos.video',
        populate: {path: 'channel_id', select: 'title'}
      })
      // .skip(page * 8).limit(8)
      .exec((error, user) => {

        if(error){
          return callback(error);
        }

        const paged_data = user.continue_watching_videos.slice(page * 8, (page * 8) + 8);

        return callback(null, paged_data);
      })
  }

  getUserPurchasedVideo(id, decoded, callback) {
    User.findById(id, '-__v -password')
    .populate('purchased_videos')
    .populate('subscribed_channels.channel')
    .exec(callback);
  };

}

module.exports = UserLib;
