'use strict';

const CommonApi = require('../component/api');
const CommonLib = require('../component/lib');

const InputValidate = require('../component/inputValidate');

const VideoLib = require('../lib/VideoLib');
const Video = require('../models/Video');
const Event = require('../models/Event');
const UserLib = new (require('../lib/UserLib'));
const VimeoLib = require('../lib/VimeoLib');

class VideoApi extends CommonApi{

  constructor(){

    super('video', Video, VideoLib, ["create", "update"]);

    this.router.route('/').post(this.create);
    this.router.route('/').put(this.update);

    this.router.route('/bySource/:id').get((request, response, next) => {
      request.infos.strict = true;
      this.wrap(this.modelLib.getVideoBySourceId, request.params.id, request.decoded, request, next);
    })

    this.router.route('/bySourceLight/:id').get((request, response, next) => {
      request.infos.strict = true;
      this.wrap(this.modelLib.getVideoBySourceIdLight, request.params.id, request.decoded, request, next);
    })

    this.router.route('/forCategory/:category_id/:page/:page_size').get((request, response, next) => {
      this.wrap(this.modelLib.getVideosForCategory, request.params.category_id, request.params.page, request.params.page_size, request, next);
    })

    this.router.route('/userHistory').get((request, response, next) => {
      this.wrap(this.modelLib.getUserHistory, request.decoded, request, next);
    })

    this.router.route('/popular').get((request, response, next) => {
      this.wrap(this.modelLib.getPopularVideo, request.decoded, request, next);
    })

    this.router.route('/popularWithSkipOption/:skip_option/:limit_option').get((request, response, next) => {
      this.wrap(this.modelLib.getPopularVideoWithSkipOption, request.params.skip_option, request.params.limit_option, request, next);
    })

    this.router.route('/trending/:page/:page_size').get((request, response, next) => {
      this.wrap(this.modelLib.getTrendings, request.params.page, request.params.page_size, request, next);
    });

    this.router.route('/similar/:video_id').get((request, response, next) => {
      this.wrap(this.modelLib.getSimilarVideos, request.params.video_id, request, next);
    })

    this.router.route('/getVideoByFilter').post((request, response, next) => {
      this.wrap(this.modelLib.getVideoByFilter, request.body, request.decoded, request, next);
    })

    this.router.route('/flag').post((request, response, next) => {
      this.wrap(this.modelLib.flag, request.body, request.decoded, request, next);
    })

    this.router.route('/searchInChannel/:channel_id/:search_term/:page').get((request, response, next) => {
      this.wrap(this.modelLib.searchInChannel, request.params.channel_id, request.params.search_term, request.params.page, request.decoded, request, next);
    })

    this.router.route('/channelRecent/:channel_id/:page').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelRecentVideos, request.params.channel_id, request.params.page, request.decoded, request, next);
    })

    this.router.route('/channelFeatured/:channel_id/:page').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelFeaturedVideos, request.params.channel_id, request.params.page, request.decoded, request, next);
    })

    this.router.route('/channelPopular/:channel_id/:page').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelPopularVideos, request.params.channel_id, request.params.page, request.decoded, request, next);
    })

    this.router.route('/channelVideos/:channel_id/:page/:page_size').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelVideos, request.params.channel_id, Number(request.params.page), Number(request.params.page_size), request.decoded, request, next);
    })

    this.router.route('/channelOfflineVideos/:channel_id/:page').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelOfflineVideos, request.params.channel_id, request.params.page, request.decoded, request, next);
    })

    this.router.route('/reportPlay/:video_id').get((request, response, next) => {
      this.wrap(this.modelLib.reportPlay, request.params.video_id, request.decoded, request, next);
    })

    this.router.route('/importVideoLink').post((request, response, next) => {
      this.wrap(this.modelLib.importVideoLink, request.body.video_link, request.decoded, request, next);
    })

    this.router.route('/updatePlayState').post((request, response, next) => {
      if(!InputValidate.notNull("data.video", request.body.video, request, next))return next();

      request.infos.return_only_id = true;
      this.wrap(this.modelLib.updatePlayState, request.body, request.decoded, request, next);
    })

    this.router.route('/getUserLastestVideoPublished').get((request, response, next) => {
      this.wrap(this.modelLib.getUserLastestVideoPublished, request.decoded, request, next);
    })

    this.router.route('/getUserUploadedVideo').get((request, response, next) => {
      this.wrap(this.modelLib.getUserUploadedVideo, request.decoded, request, next);
    })

    this.router.route('/favorite').get((request, response, next) => {
      this.wrap(this.modelLib.getUserFavoriteVideo, request.decoded, request, next);
    })

    this.router.route('/prepareVimeoUpload').post((request, response, next) => {
      this.wrap(VimeoLib.getVideoUploadURL, request.body, request, next);
    })

    this.router.route('/setVideoInactive/:video_id').get((request, response, next) => {
      this.wrap(this.modelLib.setVideoInactive, request.params.video_id, request.decoded, request, next);
    });

    this.router.route('/checkMyUploadedVideoStatus').post((request, response, next) => {
      this.wrap(this.modelLib.checkMyUploadedVideoStatus, request.body, request.decoded, request, next);
    })

    // endpoint for live start here ---------------------------------------------------
    this.router.route('/channelCurrent/:channel_id').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelLive, request.params.channel_id, request.decoded, request, next);
    })

    this.router.route('/channelFuture/:channel_id/:start_week/:end_week').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelFutureLive, request.params.channel_id, request.params.start_week, request.params.end_week, request.decoded, request, next);
    })

    this.router.route('/getLive/:live_id').get((request, response, next) => {
      this.wrap(this.modelLib.getLive, request.params.live_id, request.decoded, request, next);
    })

    this.router.route('/getUserLive').get((request, response, next) => {
      this.wrap(this.modelLib.getUserLive, request.decoded, request, next);
    })

    this.router.route('/getUserUpcommingAndCurrentLives').get((request, response, next) => {
      this.wrap(this.modelLib.getUserUpcommingAndCurrentLives, request.decoded, request, next);
    })

    this.router.route('/getAllLives').get((request, response, next) => {
      this.wrap(this.modelLib.getAllLives, request.decoded, request, next);
    })

    this.router.route('/getActualLives').get((request, response, next) => {
      this.wrap(this.modelLib.getActualLives, request.decoded, request, next);
    })

    this.router.route('/getPopularLives').get((request, response, next) => {
      this.wrap(this.modelLib.getPopularLives, request.decoded, request, next);
    })

    this.router.route('/getRecentLives/:start/:end').get((request, response, next) => {
      this.wrap(this.modelLib.getRecentLives, request.params.start, request.params.end, request.decoded, request, next);
    })

    this.router.route('/getUpcommingLives/:start/:end/:limit').get((request, response, next) => {
      this.wrap(this.modelLib.getUpcommingLives, request.params.start, request.params.end, request.params.limit, request.decoded, request, next);
    })

    this.router.route('/getUserUpcommingLives').get((request, response, next) => {
      this.wrap(this.modelLib.getUserUpcommingLives, request.decoded, request, next);
    })

    // updates
    this.router.route('/endLiveSession/:live_id').get((request, response, next) => {
      request.infos.return_only_id = true;
      this.wrap(this.modelLib.endLiveSession, request.params.live_id, request.decoded, request, next);
    })

    this.router.route('/startLiveSession/:live_id').get((request, response, next) => {
      request.infos.return_only_id = true;
      this.wrap(this.modelLib.startLiveSession, request.params.live_id, request.decoded, request, next);
    })

    this.router.route('/liveReportPlay/:live_id').get((request, response, next) => {
      request.infos.return_only_id = true;
      this.wrap(this.modelLib.liveReportPlay, request.params.live_id, request.decoded, request, next);
    })

    this.router.route('/similarLives/:live_id').get((request, response, next) => {
      this.wrap(this.modelLib.getSimilarLives, request.params.live_id, request, next);
    })

    this.router.route('/updateViewers').post((request, response, next) => {
      this.wrap(this.modelLib.updateViewers, request.body, request, next);
    })


    // New twilio live update
    this.router.route('/checkRoom/:roomName').get((request, response, next) => {
      this.wrap(this.modelLib.checkRoom, request.params.roomName, request, next);
    })

    this.router.route('/createRoom').post((request, response, next) => {
      this.wrap(this.modelLib.createRoom, request.body.roomName,request.body.maxNoPeople, request, next);
    })

    this.router.route('/generateToken/:roomName').get((request, response, next) => {
      this.wrap(this.modelLib.generateToken, request.decoded, request.params.roomName, request, next);
    })
    this.router.route('/getConnectedUser/:roomName').get((request, response, next) => {
      this.wrap(this.modelLib.getConnectedUser, request.decoded, request.params.roomName, request, next);
    })
    // End twilio live

    // endpoint for live end here -----------------------------------------------------
  }

  create = (request, response, next) => {

    if(!InputValidate.notNull("video.title", request.body.title, request, next))return next();
    if(!InputValidate.notNull("video.privacy_settings", request.body.privacy_settings, request, next))return next();

    this.wrap(this.modelLib.createVideo, request.body, request.decoded, request, next);
  }

  update = (request, response, next) => {

    this.wrap(this.modelLib.updateVideo, request.body, request.decoded, request, next);
  }

  // endpoint for live start here ---------------------------------------------------
  updateLive = (request, response, next) => {
    this.wrap(this.modelLib.updateLive, request.body, request.decoded, request, next);
  }
  // endpoint for live end here -----------------------------------------------------
}

module.exports = VideoApi;
