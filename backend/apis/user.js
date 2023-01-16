'use strict';

const bcrypt = require('bcrypt');

const CommonApi = require('../component/api');
const InputValidate = require('../component/inputValidate');

const UserLib = require('../lib/UserLib');
const User    = require('../models/User');

const ChannelLib = new (require('../lib/ChannelLib'));
const VideoLib = new (require('../lib/VideoLib'));
const AuthLib = require('../lib/AuthLib');

const fs = require('fs');
const path = require('path');
const jsonwt = require('jsonwebtoken');
const jwt_config = require('../auth/config/jwt');

class UserApi extends CommonApi{

  constructor(){

    super('user', User, UserLib, ["update"]);

    this.router.route('/').post(this.create);
    this.router.route('/').put(this.updateUser);

    this.router.route('/connected').get(this.getConnectedUser);

    this.router.route('/byChannel/:channel_id').get(this.getUserByChannel);

    this.router.route('/detailNoPopulate/:id').get((request, response, next) => {
      this.wrap(this.modelLib.detailNoPopulate, request.params.id, request.decoded, request, next);
    })

    this.router.route('/detailPopulate/:id').get((request, response, next) => {
      this.wrap(this.modelLib.detailPopulate, request.params.id, request.decoded, request, next);
    });

    this.router.route('/getUserPurchasedVideo/:id').get((request, response, next) => {
      this.wrap(this.modelLib.getUserPurchasedVideo, request.params.id, request.decoded, request, next);
    });

    this.router.route('/searchHistory').get((request, response, next) => {
      this.wrap(this.modelLib.searchHistory, request.decoded, request, next);
    })

    this.router.route('/subscriptions').get((request, response, next) => {
      this.wrap(this.modelLib.getSubscriptions, request.decoded, request, next);
    })

    this.router.route('/subscriptionsbyid/:user_id/:channel_id').get(this.subscriptionsbyid);

    this.router.route('/channelRecentDonators/:channel_id').get((request, response, next) => {
      this.wrap(this.modelLib.channelRecentDonators, request.params.channel_id, request.decoded, request, next);
    })

    this.router.route('/subscribe/:channel_id').get(this.subscribe);
    this.router.route('/unsubscribe/:channel_id').get(this.unsubscribe);
    this.router.route('/addToFavorite/:video_id').get(this.addToFavorite);
    this.router.route('/removeFromFavorite/:video_id').get(this.removeFromFavorite);
    this.router.route('/addToWatchLater/:video_id').get(this.addToWatchLater);
    this.router.route('/removeFromWatchLater/:video_id').get(this.removeFromWatchLater);

    this.router.route('/updatesFromSubscription').get(this.getUpdatesFromSubscription);
    this.router.route('/updatesFromSubscriptionsDetail/:page/:page_size').get(this.getUpdatesFromSubscriptionsDetails);
    this.router.route('/removeFromUpdatesFromSubscriptions/:channel_id').get(this.removeFromUpdatesFromSubscriptions);
    this.router.route('/lastPausedVideo').get((request, response, next) => {
      this.wrap(this.modelLib.lastPausedVideo, request.decoded, request, next);
    })
    this.router.route('/myChannels').get((request, response, next) => {
      this.wrap(this.modelLib.myChannels, request.decoded, request, next);
    })
    this.router.route('/recommended').get(this.getRecommended);
    this.router.route('/watchLater/:page').get((request, response, next) => {
      this.wrap(this.modelLib.watchLater, request.params.page, request.decoded, request, next);
    })

    this.router.route('/continueWatching/:page').get((request, response, next) => {
      this.wrap(this.modelLib.continueWatching, request.params.page, request.decoded, request, next);
    })

    this.router.route('/signup').post(this.signup);
    // this can be restored when Eldad need it
    // this.router.route('/registerUserFromSocialNetwork').post(this.registerUserFromSocialNetwork);
    this.router.route('/login').post(this.login);
    this.router.route('/forgotPassword').post(this.forgotPassword);
    this.router.route('/resetPassword').post(this.resetPassword);
    this.router.route('/checkAndUpdatePassword').post(this.checkAndUpdatePassword);
    this.router.route('/activateAccount').post(this.activateAccount);

    this.router.route('/notificationsConfig').get((request, response, next) => {
      this.wrap(this.modelLib.notificationsConfig, request.decoded, request, next);
    })
  }

  getConnectedUser = (request, response, next) => {
    this.wrap(this.modelLib.detail, request.decoded._id, request.decoded, request, next);
  }

  getUserByChannel = (request, response, next) => {
    this.wrap(this.modelLib.getByChannel, request.params.channel_id, request.decoded, request, next);
  }

  create(request, response, next){

    if(!InputValidate.notNull("user.last_name", request.body.last_name, request, next))return next();
    this.wrap(this.modelLib.create, request.body, request.decoded, request, next);
  }

  updateUser = (request, response, next) => {
    if(!InputValidate.notNull("user._id", request.body._id, request))return next();
    this.wrap(this.modelLib.updateUser, request.body, request.decoded, request, next);
  }

  subscriptionsbyid = (request, response, next) => {
    this.wrap(this.modelLib.subscriptionsbyid, request.params.user_id, request.params.channel_id, request.decoded, request, next);
  }

  subscribe = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      this.wrap(this.modelLib.subscribe, request.params.channel_id, request.infos.data, request, () => {

        if(request.infos.error){
          return next();
        }

        this.wrap(ChannelLib.detail, request.params.channel_id, request.decoded, request, () => {

          if(request.infos.error || !request.infos.data){
            return next();
          }

          request.infos.return_only_id = true;
          this.wrap(ChannelLib.addSubscriber, request.infos.data, request.decoded, request, next);
        })
      });
    });
  }

  unsubscribe = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      request.infos.return_only_id = true;
      this.wrap(this.modelLib.unsubscribe, request.params.channel_id, request.infos.data, request, () => {

        if(request.infos.error){
          return next();
        }

        this.wrap(ChannelLib.detail, request.params.channel_id, request.decoded, request, () => {

          if(request.infos.error || !request.infos.data){
            return next();
          }

          request.infos.return_only_id = true;
          this.wrap(ChannelLib.removeSubscriber, request.infos.data, request.decoded, request, next);
        })
      });
    });
  }

  addToFavorite = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      request.infos.return_only_id = true;
      this.wrap(this.modelLib.addToFavorite, request.params.video_id, request.infos.data, request, next);
    });
  }

  removeFromFavorite = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      request.infos.return_only_id = true;
      this.wrap(this.modelLib.removeFromFavorite, request.params.video_id, request.infos.data, request, next);
    });
  }

  addToWatchLater = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      request.infos.return_only_id = true;
      this.wrap(this.modelLib.addToWatchLater, request.params.video_id, request.infos.data, request, next);
    });
  }

  removeFromWatchLater = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      request.infos.return_only_id = true;
      this.wrap(this.modelLib.removeFromWatchLater, request.params.video_id, request.infos.data, request, next);
    });
  }

  signup = (request, response, next) => {

    // if(!InputValidate.notNull("user.username", request.body.username, request, next))return next();
    if(!InputValidate.notNull("user.email", request.body.email, request, next))return next();
    if(!InputValidate.notNull("user.password", request.body.password, request, next))return next();

    request.infos.strict = true;
    this.wrap(this.modelLib.signup, request.body, request, () => {

      if(request.infos.error){
        return next();
      }

      request.infos.return_only_id = true;
      this.wrap(ChannelLib.createFromUser, request.infos.data, request, next);
    });
  }

  // This can be restored when Eldad need it
  /*registerUserFromSocialNetwork = (request, response, next) => {
    if(!InputValidate.notNull("user.username", request.body.username, request, next))return next();

    this.wrap(this.modelLib.findUserFromSocialNetwork, request.body, request, () => {

      if(request.infos.error){
        if(!request.infos.error.type == 'NotFound') return next();
      }

      const user = request.infos.data;
      // login if user exist, register for new user
      if (user) {
        this.wrap(AuthLib.generateToken, user, request, next);
        this.backgroundExecute(User.findOneAndUpdate({_id: user._id}, {$set: {last_login: new Date()}}));
      } else {
        request.infos.strict = true;
        this.wrap(this.modelLib.signup, request.body, request, () => {

        if(request.infos.error){
          return next();
        }

        const user = request.infos.data;
        this.wrap(ChannelLib.createFromUser, request.infos.data, request, next);
        this.wrap(AuthLib.generateToken, user, request, next);
        });
      }
    })
  }*/

  login = (request, response, next) => {

    if(!InputValidate.notNull("email", request.body.email, request))return next();
    if(!InputValidate.notNull("password", request.body.password, request))return next();

    this.wrap(this.modelLib.login, request.body, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      const user = request.infos.data;

      this.wrap(bcrypt.compare, request.body.password, user.password, request, () => {

        if(!request.infos.data){
          request.infos.error = {
            type: 'InvalidCredential'
          };
          next();
        }

        this.wrap(AuthLib.generateToken, user, request, next);
        this.backgroundExecute(User.findOneAndUpdate({_id: user._id}, {$set: {last_login: new Date()}}));
      })
    })
  }

  forgotPassword = (request, response, next) => {
    if(!InputValidate.notNull("email", request.body.email, request, next))return next();

    this.wrap(this.modelLib.forgotPassword, request.body, request, () => {
      if(request.infos.error){
        return next();
      }
      return next();
    })
  }

  resetPassword = (request, response, next) => {
    const file_name = path.join(__dirname, '../auth/config') + '/public.key';
    const publicKey = fs.readFileSync(file_name, 'utf8');

    const verify_options = {
      expiresIn: jwt_config.FORGOT_PASSWORD_TOKEN_LIFETIME,
      algorithm: ['RS256']
    };

    if(!InputValidate.notNull("user.password", request.body.password, request, next))return next();
    jsonwt.verify(request.body.token, publicKey, verify_options, function(err, decoded) {

      if (err) {
        console.log("Access denied, incorrect token for password reset!");
        return next();
      }
      if (Date.now() >= decoded.exp * 1000) {
        console.log("This token has expired");
      } else {
        request.body._id = decoded._id;
      }
    });

    this.wrap(this.modelLib.resetPassword, request.body, request, () => {
      if(request.infos.error){
        return next();
      }
      return next();
    });
  }

  checkAndUpdatePassword = (request, response, next) => {

    if(!InputValidate.notNull("old_password", request.body.old_password, request))return next();
    if(!InputValidate.notNull("new_password", request.body.new_password, request))return next();

    this.wrap(this.modelLib.getUserPassword, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
       // console.log(request.infos.data);
        return next();
      }

      const user = request.infos.data;

      this.wrap(bcrypt.compare, request.body.old_password, user.password, request, () => {
        if(!request.infos.data){
          request.infos.error = {
            type: 'InvalidCredential'
          };
          return next();
        }

        User.findOne({_id: user._id}).exec(function(error, user_result) {
          user_result.password = request.body.new_password;
          user_result.save(next);
        });
      })

    })
  }

  activateAccount = (request, response, next) => {
    const file_name = path.join(__dirname, '../auth/config') + '/public.key';
    const publicKey = fs.readFileSync(file_name, 'utf8');

    const verify_options = {
      expiresIn: jwt_config.FORGOT_PASSWORD_TOKEN_LIFETIME,
      algorithm: ['RS256']
    };

    // if(!InputValidate.notNull("activation.token", request.body.token, request, next))return next();
    jsonwt.verify(request.body.token, publicKey, verify_options, function(err, decoded) {

      if (err) {
        console.log("Access denied, incorrect token for account activation!");
        return next();
      }
      if (Date.now() >= decoded.exp * 1000) {
        console.log("This token has expired");
      } else {
        request.body.email = decoded.email;
      }
    });

    this.wrap(this.modelLib.activateAccount, request.body, request, () => {
      if(request.infos.error){
        return next();
      }
      return next();
    });
  }

  getUpdatesFromSubscription = (request, respones, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      this.wrap(this.modelLib.getUpdatesFromSubscription, request.infos.data, request.decoded, request, next);
    });
  }

  getUpdatesFromSubscriptionsDetails = (request, respones, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      this.wrap(this.modelLib.getUpdatesFromSubscriptionsDetails, request.infos.data, request.decoded, request.params.page, request.params.page_size, request, next);
    });
  }

  removeFromUpdatesFromSubscriptions = (request, respones, next) => {

    this.wrap(this.modelLib.removeFromUpdatesFromSubscriptions, request.params.channel_id, request, next);
  }

  _getRecommended = (request, response, next) => {

    request.infos.strict = true;
    // find a way to populate 'videos_history' field
    this.wrap(this.modelLib._detail, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }

      this.wrap(this.modelLib._getRecommendedVideo, request.infos.data, request.decoded, request, next);
    })
  }

  getRecommended = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib.queryOne, request.decoded._id, {fields: ["recommendations"]}, request.decoded, request, () => {

      if(request.infos.error) return next();

      const conditions = {_id: {$in: request.infos.data.recommendations}, active: true, live_status: false};
      const population = [{path: "channel_id", select: "title avatar_card avatar_color"}];
      const fields = ["source_id", "meta", "title", "duration", "thumbnail", "created", "monetize", "price", "description"];
      const limit = 8;
      this.wrap(VideoLib.queryMany, {fields: fields, conditions: conditions, population: population, limit: limit}, request.decoded, request, next);
    })
  }

}

module.exports = UserApi;
