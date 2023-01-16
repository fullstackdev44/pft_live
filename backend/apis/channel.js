'use strict';

const CommonApi = require('../component/api');

const InputValidate = require('../component/inputValidate');

const ChannelLib = require('../lib/ChannelLib');
const Channel = require('../models/Channel');

class ChannelApi extends CommonApi{

  constructor(){

    super('channel', Channel, ChannelLib);

    // can't create a standalone channel
    this.router.route('/').post((request, response, next) => {
      next();
    })

    this.router.route('/mine').get((request, response, next) => {
      this.wrap(this.modelLib.getMyChannels, request.decoded, request, next);
    })

    this.router.route('/popular').get((request, response, next) => {
      this.wrap(this.modelLib.getPopulars, request.decoded, request, next);
    })

    this.router.route('/popularWithSkipOption/:skip_option/:limit_option').get((request, response, next) => {
      this.wrap(this.modelLib.getPopularsWithSkipOption, request.params.skip_option, request.params.limit_option, request.decoded, request, next);
    });

    this.router.route('/trending').get((request, response, next) => {
      this.wrap(this.modelLib.getTrendings, request.decoded, request, next);
    })

    this.router.route('/trendingWithSkipOption/:skip_option/:limit_option').get((request, response, next) => {
      this.wrap(this.modelLib.getTrendingsWithSkipOption, request.params.skip_option, request.params.limit_option, request.decoded, request, next);
    });

    this.router.route('/recent').get((request, response, next) => {
      this.wrap(this.modelLib.getRecents, request.decoded, request, next);
    })

    this.router.route('/recentWithSkipOption/:skip_option/:limit_option').get((request, response, next) => {
      this.wrap(this.modelLib.getRecentsWithSkipOption, request.params.skip_option, request.params.limit_option, request.decoded, request, next);
    });

    this.router.route('/featured/:channel_id').get((request, response, next) => {
      this.wrap(this.modelLib.getFeatured, request.params.channel_id, request.decoded, request, next);
    })
    
    this.router.route('/byCategory/:categorie_id').get((request, response, next) => {
      this.wrap(this.modelLib.getChannelByCategory, request.params.categorie_id, request.decoded, request, next);
    })
    
    this.router.route('/byCategories').post((request, response, next) => {
      this.wrap(this.modelLib.filterByCategories, request.body, request.decoded, request, next);
    })

    this.router.route('/flag').post((request, response, next) => {
      this.wrap(this.modelLib.flag, request.body, request.decoded, request, next);
    })

    this.router.route('/subscribed').get((request, response, next) => {
      this.wrap(this.modelLib.getSubscribed, request.decoded, request, next);
    })

    // this.router.route('/reportView').put((request, response, next) => {
    //   request.infos.return_only_id = true;
    //   this.wrap(this.modelLib.reportView, request.body, request.decoded, request, next);
    // })

    this.router.route('/addFeaturedVideo').put((request, response, next) => {
      this.wrap(this.modelLib.addFeaturedVideo, request.body, request.decoded, request, next);
    })

    this.router.route('/removeFeaturedVideo').put((request, response, next) => {
      this.wrap(this.modelLib.removeFeaturedVideo, request.body, request.decoded, request, next);
    })

    this.router.route('/addFeaturedChannel').put((request, response, next) => {
      this.wrap(this.modelLib.addFeaturedChannel, request.body, request.decoded, request, next);
    })

    this.router.route('/removeFeaturedChannel').put((request, response, next) => {
      this.wrap(this.modelLib.removeFeaturedChannel, request.body, request.decoded, request, next);
    })

    this.router.route('/videoCount/:channel_id').get((request, response, next) => {
      this.wrap(this.modelLib.videoCount, request.params.channel_id, request.decoded, request, next);
    })

    this.router.route('/updateVideoCount').put((request, response, next) => {
      this.wrap(this.modelLib.updateVideoCount, request.body, request.decoded, request, next);
    })

    this.router.route('/checkChannelOfUser/:user_id').get((request, response, next) => {
      this.wrap(this.modelLib.checkChannelOfUser, request.params.user_id, request.decoded, request, next);
    })

    this.router.route('/updateTitle').put((request, response, next) => {
      this.wrap(this.modelLib.updateTitle, request.body, request.decoded, request, next);
    })
  }
}

module.exports = ChannelApi;
