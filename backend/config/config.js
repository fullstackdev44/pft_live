const config = {
  env: 'prod',
  port: process.env.PORT,
  mongo: {
    url: process.env.MONGODB_URL,
  }
}

module.exports = config
