'use strict'

const CommonError = require('./error');

const send_error_data = true;

const error_status = {
	'NotFound': 404,
	'Unauthorized': 401,
	'NotImplemented': 501,
	'BadRequest': 400,
	'InvalidCredential': 401,
	//'OK': 200
}

const resolveHttpStatus = function(error_data){
	return error_status[error_data.type] || 500;
}

module.exports = function(request, response){

	//error
	if(request.infos.error){

		let error = new CommonError();

		if(send_error_data){
			error.error = request.infos.error
		}

		response.status(resolveHttpStatus(request.infos.error));

		for(let key in request.infos.error){
			error[key] = request.infos.error[key];
		}

		console.log("------------HTTP ERROR-----------");
		console.log(request.originalUrl);
		console.log(request.infos.error);
		console.log("------------HTTP ERROR-----------");

		return response.send(error);
	}

	//not_found
	if(request.infos.strict && !request.infos.data){

		let error = new CommonError();

		error.type = 'NotFound';
		error.object = request.infos.object;
		error.details = request.params;

		console.log("------------HTTP ERROR-----------");
		console.log(request.originalUrl);
		console.log(error);
		console.log("------------HTTP ERROR-----------");

		return response.status(404).send(error);
	}

	//not treated request
	if(!request.infos.data){

		let error = new CommonError();

		error.type = 'NotImplemented';
		error.object = null;
		error.details = request.params;
		error.message = "url not implemented";

		console.log("------------HTTP ERROR-----------");
		console.log(request.originalUrl);
		console.log(error);
		console.log("------------HTTP ERROR-----------");

		return response.status(501).send(error);
	}

	//success
	return response.status(200).send({data: request.infos.return_only_id ? request.infos.data._id : request.infos.data});
}
