'use strict'

module.exports = function(request, response, next){

	request.infos = {};
	return next();
}