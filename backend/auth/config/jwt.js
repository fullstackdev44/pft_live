module.exports = {
  NOT_CHECKED_PATHS: [
    { route: '/', method: 'GET' },
    { route: '/user/login', method: 'POST' },
    { route: '/user/signup', method: 'POST' },
    { route: '/user/registerUserFromSocialNetwork', method: 'POST' },
    { route: '/user/forgotPassword', method: 'POST' },
    { route: '/user/resetPassword', method: 'POST' },
    { route: '/user/activateAccount', method: 'POST' },
    { route: '/user/channelRecentDonators', method: 'GET', generic: true },

    { route: '/video/getVideoByFilter', method: 'POST' },
    { route: '/video', method: 'GET', generic: true },
    { route: '/comment', method: 'GET', generic: true },
    { route: '/channel', method: 'GET', generic: true },
    { route: '/playlist', method: 'GET', generic: true },
    { route: '/product', method: 'GET', generic: true },
    { route: '/category', method: 'GET', generic: true },
    { route: '/payment/webhook', method: 'POST' },

    { route: '/message/contactPftvTeam', method: 'POST' }
  ],
  TOKEN_LIFETIME: 86400000,
  FORGOT_PASSWORD_TOKEN_LIFETIME: 1800000
};
