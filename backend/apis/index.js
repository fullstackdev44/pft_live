'use strict'

module.exports = {
	category: new (require('./category')),
	channel: new (require('./channel')),
	comment: new (require('./comment')),
	message: new (require('./message')),
	notification: new (require('./notification')),
	playlist: new (require('./playlist')),
	user: new (require('./user')),
	video: new (require('./video')),
	product: new (require('./product')),
	payment: new (require('./payment')),
	withdrawal: new (require('./withdrawal'))
}
