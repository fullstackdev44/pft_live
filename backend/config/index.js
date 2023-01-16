const env = process.env.NODE_ENV || 'dev'
const config = require(`./config.${env}`)

const mongoose = require('mongoose')
// Mongo options
const mongoOptions = {
  keepAlive: true,
  useNewUrlParser: true,
  // reconnectTries: 50,
  // reconnectInterval: 500,
  connectTimeoutMS: 30000
}

if (env === 'dev')
  mongoOptions.autoIndex = true; // Only enable in development mode (too expensive)

// Connect to mongo
mongoose.connect(config.mongo.url, mongoOptions)
mongoose.Promise = global.Promise

// Handling connection errors
mongoose.connection.on('connected', () => {
  console.log('Successfully connected to mongodb at ' + config.mongo.url)
})

mongoose.connection.on('error', (err) => {
  console.log(err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from mongodb')
})

module.exports = config
