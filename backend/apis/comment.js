'use strict';

const CommonApi = require('../component/api');

const InputValidate = require('../component/inputValidate');

const CommentLib = require('../lib/CommentLib');
const Comment = require('../models/Comment');

class CommentApi extends CommonApi{

  constructor(){

    super('comment', Comment, CommentLib, ["create"]);

    this.router.route('/video').post(this.createForVideo);

    this.router.route('/byVideo').get((request, response, next) => {
      this.wrap(this.modelLib.getCommentHistoryForVideo, request.decoded, request, next);
    });

    this.router.route('/byVideoWithSkipOption/:skip_option').get((request, response, next) => {
      this.wrap(this.modelLib.getCommentHistoryForVideoWithSkipOption, request.params.skip_option, request.decoded, request, next);
    });

    this.router.route('/video/:video_id').get((request, response, next) => {
      this.wrap(this.modelLib.getVideoComments, request.params.video_id, request.decoded, request, next);
    });

    this.router.route('/liveChat/:video_id').get((request, response, next) => {
      this.wrap(this.modelLib.getLiveChats, request.params.video_id, request.decoded, request, next);
    });

    this.router.route('/:id').delete((request, response, next) => {
      this.wrap(this.modelLib.removeCommentWithSubComment, request.params.id, request.decoded, request, next);
    });
  }

  createForVideo = (request, response, next) => {

    if(!InputValidate.notNull("comment.video_id", request.body.video_id, request, next))return next();

    request.infos.return_only_id = true;
    this.wrap(this.modelLib.create, request.body, request.decoded, request, next);
  }
}

module.exports = CommentApi;
