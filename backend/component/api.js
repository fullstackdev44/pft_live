'use strict'

const express = require('express');

const InputValidate = require('./inputValidate');

class CommonApi{

	constructor(model_name, Model, ModelLib, overriden_methods=[]){

		// ATTRIBUTES
		this.model_name = model_name;
		this.model = Model;
		this.modelLib = new ModelLib();
		this.overriden_methods = overriden_methods;
		
		// ROUTES
		this.router = express.Router();
		this.router.use(this.routerInit);
		this.router.route('/').get(this.listAll);
		this.router.route('/').post(this._create);
		this.router.route('/query').post(this.queryMany);
		this.router.route('/query/:id').post(this.queryOne);
		this.router.route('/').put(this.update);
		this.router.route('/').delete(this.remove);
		this.router.route('/id/:id').get(this.detail);
	}

	// METHODS
	routerInit = (request, response, next) => {
		request.infos.object = this.model_name;
		next();
	}

	_create = (request, response, next) => {

		if(this.overriden_methods.indexOf("create") == -1){

			if(!InputValidate.notNull(this.model_name, request.body, request))return next();
			this.wrap(this.modelLib._create, request.body, request.decoded, request, next);
		}
		else {
			next();
		}
	}

	listAll = (request, response, next) => {
		this.wrap(this.modelLib.getAll, request.decoded, request, next);
	}

	queryOne = (request, response, next) => {
		this.wrap(this.modelLib.queryOne, request.params.id, request.body, request.decoded, request, next);
	}

	queryMany = (request, response, next) => {
		this.wrap(this.modelLib.queryMany, request.body, request.decoded, request, next);
	}

	update = (request, response, next) => {

		if(this.overriden_methods.indexOf("update") == -1){

			if(!InputValidate.notNull(this.model_name, request.body, request))return next();
			if(!InputValidate.notNull(this.model_name + "._id", request.body._id, request))return next();

			request.infos.strict = true;
			this.wrap(this.modelLib.detail, request.body._id, request.decoded, request, () => {

				if(request.infos.error || !request.infos.data){
					return next();
				}

				request.infos.return_only_id = true;
				this.wrap(this.modelLib.update, request.body, request.infos.data, request.decoded, request, next);
			})
		}
		else{
			next();
		}
	}

	detail = (request, response, next) => {
		this.wrap(this.modelLib.detail, request.params.id, request.decoded, request, next);
	}

	remove = (request, response, next) => {
		this.wrap(this.modelLib.remove, request.params.id, request.decoded, request, next);
	}

	// executable object is an object with a 'execute' method that take a callback as parameter
	// the callback function take as argument (error, data)
	execute = (executable, request, callback) => {

		if(!callback){
			return -1;
		}

		if(!request || request.infos.error){
			return callback();
		}

		executable.exec(function(error, data){

			request.infos.error = error;
			request.infos.data = data;
			
			return callback();
		})
	}

	// wrappable object is a callable object that have a callback function as his last parameter
	// the callback function take as argument (error, data)
	wrap = (wrappable, ...args) => {

		let args_length = args.length;

		if(args_length < 1){
			return -1;
		}

		const callback = args[args_length - 1];

		if(!callback){
			return -1;
		}

		if(args_length < 2){
			return callback();
		}
		
		const request = args[args_length - 2];

		if(!request || request.infos.error){
			return callback();
		}

		const params = args.slice(0, args_length - 2);

		wrappable(...params, function(error, data){

			request.infos.error = error;
			request.infos.data = data;

			if(!request.infos.error && request.infos.strict && !data){
				request.infos.error = {type: 'NotFound'};
			}

			return callback();
		});
	}

	backgroundExecute(executable){
		executable.exec(function(error, data){
            if (error) {
				console.log(error);
            }
		})
	}
}

module.exports = CommonApi
