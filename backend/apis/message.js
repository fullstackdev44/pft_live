'use strict';

const CommonApi = require('../component/api');

const InputValidate = require('../component/inputValidate');

const MessageLib = require('../lib/MessageLib');
const Message = require('../models/Message');

class MessageApi extends CommonApi{

  constructor(){

    super('message', Message, MessageLib, ["update", "create"]);

    this.router.route('/').post(this.create);
    this.router.route('/').put(this.update);
    this.router.route('/:id').delete(this.remove);

    this.router.route('/inbox').get((request, response, next) => {
      this.wrap(this.modelLib.getInbox, request.decoded, request, next);
    });

    this.router.route('/sent').get((request, response, next) => {
      this.wrap(this.modelLib.getMessageSent, request.decoded, request, next);
    });

    this.router.route('/deleted').get((request, response, next) => {
      this.wrap(this.modelLib.getDeletedMessage, request.decoded, request, next);
    });

    this.router.route('/changeStatus/:id/:status').get(this.changeStatus);
    this.router.route('/changeStatusForAll').post(this.changeStatusForAll);

    this.router.route('/contactPftvTeam').post((request, response, next) => {
      this.wrap(this.modelLib.contactPftvTeam, request.body, request.decoded, request, next);
    });
  }

  create = (request, response, next) => {

    if(!InputValidate.notNull("message.sender", request.body.sender, request, next))return next();
    if(!InputValidate.notNull("message.receiver", request.body.receiver, request, next))return next();
    if(!InputValidate.notNull("message.content", request.body.content, request, next))return next();

    this.wrap(this.modelLib.create, request.body, request.decoded, request, next);
  }

  update(request, response, next){

    if(!InputValidate.notNull("message._id", request.body._id, request, next))return next();

    this.wrap(this.modelLib.update, request.body, request.infos.data, request.decoded, request, next);
  }

  changeStatus = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib.detail, request.params.id, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }
      let message = request.infos.data;
      // request.infos.return_only_id = true;
      this.wrap(this.modelLib.changeMessageStatus, message, request.params.status, request.decoded, request, next);
    });
  }

  changeStatusForAll = (request, response, next) => {
    request.infos.strict = true;
    if(!InputValidate.notNull("message_ids", request.body.message_ids, request, next))return next();
    if(!InputValidate.notNull("status", request.body.status, request, next))return next();

    this.wrap(this.modelLib.changeMessageStatusForAll, request.body, request.decoded, request, next);
  }
}

module.exports = MessageApi;
