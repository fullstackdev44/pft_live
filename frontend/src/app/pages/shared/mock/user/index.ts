import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, randomizeString, returnObjectOfFrom, returnArrayOfFrom } from '../common';
import { returnArrayOfUrls } from '../misc';

import { User } from '../../models/user';
import { users } from './MOCK_DATA';

export function resolveUser(){
	return function(target, key, descriptor){

		return mock("resolveUser", target, key, descriptor, () => Observable.of(returnObjectOfFrom(User, users)));
	}
}

export function resolveUsers(count=2){
	return function(target, key, descriptor){

		return mock("resolveUsers", target, key, descriptor, () => Observable.of(returnArrayOfFrom(User, users, count)));
	}
}