'use strict'

const mongoose = require('mongoose');

const InputValidate = function(){

	const notNull = function(param, value, request){

		if(request.infos.error){
			return false;
		}

		if(!value){

			request.infos.error = {
				status: 400,
				type: "BadRequest",
				message: "Parameter should not be null",
				detail: param
			}

			return false;
		}

		return true;
	}

	const objectId = function(value, request, callback){

		if(!mongoose.Types.ObjectId.isValid(value)){

			request.infos.error = {
				status: 400,
				type: "BadRequest",
				message: "Parameter should be ObjectId"
			}

			return false;
		}

		return true;
	}

	return {
		notNull: notNull,
		objectId: objectId
	}
}()

module.exports = InputValidate;