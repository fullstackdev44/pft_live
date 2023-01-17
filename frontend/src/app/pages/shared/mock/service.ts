import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable({
	providedIn: 'root'
})
export class ApiService {

	constructor(protected http: HttpClient){}

	query = function(method, url, params = null, headers = null){

		let options: any = {};

		if(params)
			options.body = params;

		if(headers)
			options.headers = headers;

		return this.http.request(method, url, options=options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	extractData = function(res) {
		return (res.body && res.body.type === "application/pdf") ? res : (res['data'] || {});
	}

	handleError = function(error) {
		return Observable.throw(error.error);
	}
}
