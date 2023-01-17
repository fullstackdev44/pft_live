import { randomizeInteger } from '../common';

import urls from './urls.json';

export function returnUrl(){

	let urls_length = urls.length;

	return urls[randomizeInteger(0, urls_length-1)];
}

export function returnArrayOfUrls(count=2){

	let urls_list = [];

	for(let i = 0; i < count; i++){
		urls_list.push(returnUrl());
	}

	return urls_list;
}