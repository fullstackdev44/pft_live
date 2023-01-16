'use strict';
const async = require('async');
const CommonLib = require('../component/lib');

const Notification = require('../models/Notification');
const User = require('../models/User');

const SOCKET_URL = process.env.API_BASE_URL;
var io = require('socket.io-client');
var socket = io.connect(SOCKET_URL, {reconnect: true});

class NotificationLib extends CommonLib{

  constructor(){
    super(Notification);
  }

  create = (notification_data, decoded, callback) => {
    // populate avatar color and card for socket message
    let sender_full_name = notification_data.sender.full_name;
    let video_name = undefined;
    if (notification_data.video_name) {
      video_name = (notification_data.video_name ? notification_data.video_name : undefined);
    } else {
      delete notification_data.video_name;
    }
    let sender_avatar_card = notification_data.sender.avatar_card;
    let sender_avatar_color = notification_data.sender.avatar_color;
    let is_a_live = undefined, live_id = undefined, comment_content = undefined;
    if(notification_data.is_a_live && notification_data.is_a_live == true) {
      is_a_live = notification_data.is_a_live;
      live_id = notification_data.live_id;
      comment_content = notification_data.comment_content;
      delete notification_data.is_a_live;
      delete notification_data.live_id;
      delete notification_data.comment_content;
    }
    let notification = new Notification();

    for (const key in notification_data) {
      if ({}.hasOwnProperty.call(notification_data, key)) {
        notification[key] = notification_data[key];
      }
    }
    notification.sender = decoded._id;
    notification.save((err, saved) => {
      let notification_mapped = {};
      notification_mapped =  JSON.parse(JSON.stringify(saved));
      notification_mapped.sender_avatar_color = sender_avatar_color;
      notification_mapped.sender_avatar_card = sender_avatar_card;
      notification_mapped.sender_full_name = sender_full_name;
      if (video_name) {
        notification_mapped.video_name = video_name;
      }
      if (comment_content) {
        notification_mapped.comment_content = comment_content;
        notification_mapped.live_id = live_id;
      }
      if (is_a_live == true) {
        socket.emit('send_chat_to_server', {
          chat: [notification_mapped]
        });
      } else {
        socket.emit('send_notification_to_server', {
          notification: [notification_mapped]
        });
      }
      callback(null, 'done');
    });

  }

  getUnreadNotification(decoded, callback) {
    Notification.find({receiver: decoded._id, status: 'UNREAD'})
      .populate('sender', 'full_name avatar_color avatar_card')
      .populate({
        path: 'comment',
        populate: {
          path: 'video_id',
          select: 'title source_id'
        }
      })
      .sort({created: -1})
      .exec((err, data) => {

        if(err){
          return callback(err);
        }

        User.findById(decoded._id).exec((error, user) => {

          if(error){
            return callback(error);
          }

          for(let i = data.length - 1; i >= 0; i--) {
            for(let j = user.notifications.length - 1; j >= 0; j--) {
              if (data[i] && (data[i].type == user.notifications[j].name) && (user.notifications[j].status == false)) {
                data.splice(i, 1);
              }
            }
          }

          let blocked_user_mapped = user && user.blocked_users && user.blocked_users.length > 0 ? user.blocked_users.map(current => current.user) : [];
          for(let i = data.length - 1; i >= 0; i--) {
            let is_blocked = blocked_user_mapped.includes(data[i].sender._id);
            if (is_blocked) {
              data.splice(i, 1);
            }
          }

          callback(null, data);
        })

      });
  };

  changeNotificationStatus(notification, status, decoded, callback) {

    notification.status = status;
    notification.save(callback);
  }

  changeNotificationStatusForAll(data, decoded, callback) {
    async.each(data.notification_ids, (notification_id, async_callback) => {
      Notification.findById(notification_id, (error, notification) => {
        if (error) {
          async_callback(error);
        }
        notification.status = data.status;
        notification.save(async_callback);
      });
    },
    (error) => {
      if (error) {
        callback(error);
      } else {
        callback(null, 'done');
      }
    });
  }
}

module.exports = NotificationLib;
