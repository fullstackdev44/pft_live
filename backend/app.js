const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const config = require('./config')
const bearerToken = require('express-bearer-token');

// node cron
var cron = require('node-cron');
const VimeoLib = require('./lib/VimeoLib');

// components
const outputEndpoint = require('./component/outputEndpoint');
const commonmiddleware = require('./component/middleware');

// auth middleware
const auth = require('./auth/auth');

// Application setup
const app = express()

app.use(
  bodyParser.json({
    // I change limit from 5mb to 10mb, this will allow user to upload high quality channel profile image,
    // I see on forum some website use till 50mb.
    limit: '50mb',
    // We need the raw body to verify webhook signatures.
    verify: function(req, res, buf) {
      //console.log("Original url: " + req.originalUrl);
      if (req.originalUrl.startsWith('/payment/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(cors())

// auth guard
app.use(bearerToken());

app.use(auth);
app.use(commonmiddleware);

// Register routes
const apis = require('./apis');

// avoid 400 error on root
app.get('/', (req, res) => {res.send('PFTV backend')});

app.use('/category', apis.category.router);
app.use('/channel', apis.channel.router);
app.use('/comment', apis.comment.router);
app.use('/message', apis.message.router);
app.use('/notification', apis.notification.router);
app.use('/playlist', apis.playlist.router);
app.use('/user', apis.user.router);
app.use('/video', apis.video.router);
app.use('/product', apis.product.router);
app.use('/payment', apis.payment.router);
app.use('/withdrawal', apis.withdrawal.router);

app.use(outputEndpoint);

// SOCKET for chat message
const http = require('http');
const server = http.Server(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const Message = require('./models/Message');
const async = require('async');

io.on('connection', (socket) => {
  socket.on('send_message_to_server', (message_data) => {
    io.emit('send_message_to_client', {
      message: message_data
    });
  });
  socket.on('send_notification_to_server', (notification_data) => {
    io.emit('send_notification_to_client', {
      notification: notification_data
    });
  });
  socket.on('send_chat_to_server', (chat_data) => {
    io.emit('send_chat_to_client', {
      chat: chat_data
    });
  });
  socket.on('send_viewer_to_server', (viewer_number) => {
    io.emit('send_viewer_to_client', {
      viewer: viewer_number
    });
  });
  socket.on('send_like_to_server', (like_number) => {
    io.emit('send_like_to_client', {
      likes: like_number
    });
  });
});

// const socket_port = process.env.SOCKET_PORT;

// server.listen(socket_port, () => {
//     console.log(`socket started on port ${socket_port}`);
// });
// --------------- end SOCKET code ------------

server.listen(config.port || process.env.PORT || 8080)
console.log('Starting server... Listening on port ' + config.port)


// CRON JOBS who check and changes automatically video upload_status
// to 'COMPLETE' once status in vimeo is 'COMPLETE'
cron.schedule('* * * * *', () => {
  VimeoLib.checkUploadingVideos(function(err, data) {
      if (err){
        // return callback(err);
      }

    });
});
// --------------- end CRON JOBS code ------------

module.exports = app
