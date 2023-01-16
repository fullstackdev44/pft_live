'use strict';
const async = require('async');
const CommonLib = require('../component/lib');

const Message = require('../models/Message');
const User = require('../models/User');

const sgMail = require('@sendgrid/mail');

const SOCKET_URL = process.env.API_BASE_URL;
var io = require('socket.io-client');
var socket = io.connect(SOCKET_URL, {reconnect: true});

class MessageLib extends CommonLib{

  constructor(){
    super(Message);
  }

  create = (message_data, decoded, callback) => {
    // --------------- update from socket ----------------
    let receiver_ids = message_data.receiver;
    let messages_sent = [];
    // populate avatar color and card for socket message
    let sender_avatar_card = message_data.sender.avatar_card;
    let sender_avatar_color = message_data.sender.avatar_color;

    async.each(receiver_ids, (receiver, async_callback) => {

      let message = new Message();

      for (const key in message_data) {
        if ({}.hasOwnProperty.call(message_data, key)) {
          message[key] = message_data[key];
        }
      }

      // update coach contacts to add the user when an user send a message to coach
      User.findById(receiver, { contacts: true }).exec((user_error, user_data) => {
        if (user_error) {
          console.log("can't add user to coach contact as user is not found");
        }

        let user_data_contacts = [];
        user_data_contacts = user_data.contacts.map(current => current._id ? current._id.toString() : current.toString() );
        if (user_data_contacts.indexOf(message_data.sender._id ? message_data.sender._id.toString() : message_data.sender.toString()) == -1) {
          user_data.contacts.push(message_data.sender);
          user_data.save();
        }
      });

      message.receiver = receiver;
      message.save((err, saved) => {
        // use populated avatar color and card for socket message
        let message_mapped = {};
        message_mapped =  JSON.parse(JSON.stringify(saved));
        message_mapped.sender_avatar_color = sender_avatar_color;
        message_mapped.sender_avatar_card = sender_avatar_card;
        messages_sent.push(message_mapped);
        async_callback();
      });

    },
    (error) => {
      if (error) {
        callback(error);
      } else {
        if (messages_sent && messages_sent.length > 0) {
          socket.emit('send_message_to_server', {
            message: messages_sent
          });
          callback(null, 'done');
        }
      }
    });
    // --------------- end update from socket ----------------


    // ---------------- DEFAULT CODE -----------------
    /*let receiver_ids = message_data.receiver;

    receiver_ids.map((current, index) => {
      let message = new Message();

      for (const key in message_data) {
        if ({}.hasOwnProperty.call(message_data, key)) {
          message[key] = message_data[key];
        }
      }

      message.receiver = receiver_ids[index];
      message.sender = decoded._id;
      message.save();
    });
    callback(null, 'done');*/
    // ---------------- DEFAULT CODE -----------------
  }

  getInbox(decoded, callback) {
    Message.find({
      receiver: decoded._id,
      $or: [{status: 'SENT'}, {status: 'READ'}, {status: 'UNREAD'}]
    })
    .populate('sender')
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
            for(let j = user.blocked_users.length - 1; j >= 0; j--) {
              if (data[i] && (data[i].sender._id.toString() == user.blocked_users[j].user.toString())) {
                data.splice(i, 1);
              }
            }
          }

          callback(null, data);
        })

      });
  };

  getMessageSent(decoded, callback) {
    Message.find({sender: decoded._id, status: 'SENT'}).populate('sender').populate('receiver', 'full_name').exec(callback);
  };

  getDeletedMessage(decoded, callback) {

    Message.find({
      $or: [{sender: decoded._id}, {receiver: decoded._id}],
      $or: [{status: 'DELETED'}]
    })
    .populate('sender')
    .exec(callback);
  };

  changeMessageStatus(message, status, decoded, callback) {

    message.status = status;
    message.save(callback);
  }

  changeMessageStatusForAll(data, decoded, callback) {
    async.each(data.message_ids, (message_id, async_callback) => {
      Message.findById(message_id, (error, message) => {
        if (error) {
          async_callback(error);
        }
        message.status = data.status;
        message.save(async_callback);
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

  contactPftvTeam(data, decoded, callback) {

    if (decoded && decoded._id) {
      User.findById(decoded._id, {full_name: true, email :true}).exec((err, user) => {

        if (err) {
          return callback(err);
        }

        const msg = {
          to: process.env.PFTV_EMAIL,
          from: {
            email: process.env.PFTV_EMAIL,
            name: 'Project Fitness TV'
          },
          // text: 'Message from contact page',
          subject: 'Message from contact page',
          html: '<p>An user send a message from contact page</p> <br>' + user.full_name + ' (' + user.email + ') ' + '<br> <p>' + data.message_content + '</p>'
        };
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail
          .send(msg)
          .then(() => {
            console.log("verification mail sent to:");
            console.log(process.env.PFTV_EMAIL);
            callback(null, 'done');
          }, error => {
            console.error(error);
            if (error.response) {
              console.error(error.response.body)
            }
            callback('email error');
          });
    });
  } else {
    const msg = {
      to: process.env.PFTV_EMAIL,
      from: {
        email: process.env.PFTV_EMAIL,
        name: 'Project Fitness TV'
      },
      // text: 'Message from contact page',
      subject: 'Message from contact page',
      html: '<p>A visitor send a message from contact page</p> <br> <p>' + data.message_content + '</p>'
    };
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail
      .send(msg)
      .then(() => {
        console.log("verification mail sent to:");
        console.log(process.env.PFTV_EMAIL);
        callback(null, 'done');
      }, error => {
        console.error(error);
        if (error.response) {
          console.error(error.response.body)
        }
        callback('email error');
      });
    }
  }

}

module.exports = MessageLib;