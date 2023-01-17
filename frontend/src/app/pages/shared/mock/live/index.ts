import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, randomizeString, returnObjectOfFrom, returnArrayOfFrom } from '../common';

import { Video } from '../../models/video';
import { lives, thumbnails } from './MOCK_DATA';

export function resolveLive(){
	return function(target, key, descriptor){

		return mock("resolveLive", target, key, descriptor, () => {

			let one_live = returnObjectOfFrom(Video, lives);
			one_live.thumbnails = randomizeString(thumbnails);

			return Observable.of(one_live);
		});
	}
}

export function resolveLives(count=2){
	return function(target, key, descriptor){

		return mock("resolveLives", target, key, descriptor, () => {

			let lives_list = returnArrayOfFrom(Video, lives, count);
			lives_list.map(current => current.thumbnails = randomizeString(thumbnails));

			return Observable.of(lives_list);
		});
	}
}