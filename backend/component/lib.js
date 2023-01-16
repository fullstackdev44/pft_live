'use strict'

class CommonLib{

	constructor(model){
		this.model = model;
	}

	getAll = (decoded, callback) => {
		this.model.find(callback);
	}

	findIn = (ids, callback) => {
		this.model.find({_id: { $in: ids }}, callback);
	}

	queryOne = (id, parameters, decoded, callback) => {

		let fields = {};
		let population = [];

		if(parameters.fields){
			parameters.fields.map(current_field => fields[current_field] = true);
		}

		if(parameters.population){
			population = parameters.population
		}

		this.model.findById(id, fields).populate(...population).exec(callback);
	}

	queryMany = (parameters, decoded, callback) => {

		let conditions = {};
		let fields = {};
		let population = [];
		let limit = -1;

		if(parameters.conditions){
			conditions = parameters.conditions;
		}

		if(parameters.fields){
			parameters.fields.map(current_field => fields[current_field] = true);
		}

		if(parameters.population){
			population = parameters.population
		}

		if(parameters.limit){
			limit = parameters.limit
		}

		this.model.find(conditions, fields).populate(...population).limit(limit).exec(callback);
	}

	_create = (model_data, decoded, callback) => {

		let new_model = new this.model();

		for (const key in model_data) {
			if ({}.hasOwnProperty.call(model_data, key)) {
				new_model[key] = model_data[key];
			}
		}
		new_model.created = new Date();
		new_model.save(callback);
	};

	detail = (id, decoded, callback) => {
		this.model.findById(id, '-__v', callback);
	};

	update(model_data, model_object, decoded, callback){

		delete model_data._id;

		for (const key in model_data) {
			if ({}.hasOwnProperty.call(model_data, key)) {
				model_object[key] = model_data[key];
			}
		}

		model_object.save(callback);
	}

	remove = (object_id, decoded, callback) => {
		this.model.remove({_id: object_id }, callback);
	};
}

module.exports = CommonLib;
