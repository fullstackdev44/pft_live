import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, randomizeString, returnObjectOfFrom, returnArrayOfFrom } from '../common';

import { Product } from '../../models/product';
import { products, thumbnails } from './MOCK_DATA';

export function resolveProduct(){
	return function(target, key, descriptor){

		return mock("resolveProduct", target, key, descriptor, () => Observable.of(returnObjectOfFrom(Product, products)));
	}
}

export function resolveProducts(count=2){
	return function(target, key, descriptor){

		return mock("resolveProducts", target, key, descriptor, () => {

			let products_list = returnArrayOfFrom(Product, products, count);
			products_list.map(current => {

				current.picture = randomizeString(thumbnails);
			})

			return Observable.of(products_list)
		});
	}
}