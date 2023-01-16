'use strict';

const CommonApi = require('../component/api');

const InputValidate = require('../component/inputValidate');

const NotificationLib = require('../lib/NotificationLib');
const Notification = require('../models/Notification');

class NotificationApi extends CommonApi{

  constructor(){

    super('notification', Notification, NotificationLib, ["create"]);

    this.router.route('/').post(this.create);

    this.router.route('/unread').get((request, response, next) => {
      this.wrap(this.modelLib.getUnreadNotification, request.decoded, request, next);
    });

    this.router.route('/changeStatus/:id/:status').get(this.changeStatus);
    this.router.route('/changeStatusForAll').post(this.changeStatusForAll);
  }

  create = (request, respoapinse, next) => {

    if(!InputValidate.notNull("notification.sender", request.body.sender, request, next))return next();
    if(!InputValidate.notNull("notification.receiver", request.body.receiver, request, next))return next();

    this.wrap(this.modelLib.create, request.body, request.decoded, request, next);
  }

  changeStatus = (request, response, next) => {

    request.infos.strict = true;
    this.wrap(this.modelLib.detail, request.params.id, request.decoded, request, () => {

      if(request.infos.error || !request.infos.data){
        return next();
      }
      let notification = request.infos.data;
      // request.infos.return_only_id = true;
      this.wrap(this.modelLib.changeNotificationStatus, notification, request.params.status, request.decoded, request, next);
    });
  }

  changeStatusForAll = (request, response, next) => {
    request.infos.strict = true;
    if(!InputValidate.notNull("notification_ids", request.body.notification_ids, request, next))return next();
    if(!InputValidate.notNull("status", request.body.status, request, next))return next();

    this.wrap(this.modelLib.changeNotificationStatusForAll, request.body, request.decoded, request, next);
  }
}

module.exports = NotificationApi;
