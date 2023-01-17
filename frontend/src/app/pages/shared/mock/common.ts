import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';

// Main Helper
export const mock = function(name, target, key, descriptor, mocker){

	let originalMethod = descriptor.value;

	descriptor.value = function(...args){

		if(environment.config && environment.config["mock"]){
			if(environment.config && environment.config["log_mock"]){
				console.log(name + " mocking ...");
			}
			return mocker();
		}

		if(environment.config && environment.config["log_mock"]){
			console.log(name + " mocking unactive...");
		}
		
		return originalMethod.apply(this, args);
	}

	return descriptor;
}

export const wrap = function(name, target, key, descriptor, wrapper, ...wrapper_args){

	let originalMethod = descriptor.value;

	descriptor.value = function(...args){

		wrapper(() => {

			console.log(name + " wrapping start...");
			originalMethod.apply(this, args);
			console.log(name + " wrapping end...");
		}, wrapper_args);
	}

	return descriptor;
}

// Random generator
export const randomizeBoolean = function(){
	return Math.random() > 0.5;
}

export const randomizeFloat = function(min, max){
	return (Math.random() * (max - min)) + min;
}

export const randomizeInteger = function(min, max){
	return Math.floor(randomizeFloat(min, max));
}

export const randomizeString = function(data){
	return data.length > 0 ? data[randomizeInteger(0, data.length-1)] : "default_mock_string";
}

// Helpers
export const returnObjectOfFrom = function(className, data){

	let new_object = new className();

	const selected_data = data[randomizeInteger(0, data.length-1)];

	for(let key in selected_data)
		new_object[key] = selected_data[key];

	return new_object;
}

export const returnArrayOfFrom = function(className, data, count=2){

	let returned_objects = [];

	for(var i=0; i<count; i++)
		returned_objects.push(returnObjectOfFrom(className, data));

	return returned_objects;
}

// Decorators
export function returnBoolean(random=true, value=true){
	
	return function(target, key, descriptor){

		return mock("returnBoolean", target, key, descriptor, () => random ? randomizeBoolean() : value);
	}
}

export function returnString(data=[]){

	return function(target, key, descriptor){

		return mock("returnString", target, key, descriptor, () => randomizeString(data));
	}
}

export function returnInteger(min=0, max=1000, value=null){

	return function(target, key, descriptor){

		return mock("returnInteger", target, key, descriptor, () => value ? value : randomizeInteger(min, max));
	}
}

export function returnFloat(min=0, max=1000, value=null){

	return function(target, key, descriptor){

		return mock("returnFloat", target, key, descriptor, () => value ? value : randomizeFloat(min, max));
	}
}

export function timeOut(milliseconds=0){

	return function(target, key, descriptor){

		return wrap("timeOut", target, key, descriptor, setTimeout, milliseconds);
	}
}

// Service decorators
export function resolveBoolean(random=true, value=true){
	
	return function(target, key, descriptor){

		return mock("returnBoolean", target, key, descriptor, () => Observable.of(random ? randomizeBoolean() : value));
	}
}

export function resolveString(data=[]){

	return function(target, key, descriptor){

		return mock("returnString", target, key, descriptor, () => Observable.of(randomizeString(data)));
	}
}

export function resolveInteger(min=0, max=1000, value=null){

	return function(target, key, descriptor){

		return mock("returnInteger", target, key, descriptor, () => Observable.of(value ? value : randomizeInteger(min, max)));
	}
}

export function resolveFloat(min=0, max=1000, value=null){

	return function(target, key, descriptor){

		return mock("returnFloat", target, key, descriptor, () => Observable.of(value ? value : randomizeFloat(min, max)));
	}
}