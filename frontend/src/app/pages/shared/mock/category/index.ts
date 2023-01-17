import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, returnObjectOfFrom, returnArrayOfFrom } from '../common';

import { Category } from '../../models/category';
import { categories } from './MOCK_DATA';

export function resolveCategory(){
	return function(target, key, descriptor){

		return mock("resolveCategory", target, key, descriptor, () => Observable.of(returnObjectOfFrom(Category, categories)));
	}
}

export function resolveCategories(count=2){
	return function(target, key, descriptor){

		return mock("resolveCategories", target, key, descriptor, () => Observable.of(returnArrayOfFrom(Category, categories, count)));
	}
}