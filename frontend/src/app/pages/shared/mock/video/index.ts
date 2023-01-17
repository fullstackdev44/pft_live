import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, randomizeString, returnObjectOfFrom, returnArrayOfFrom } from '../common';

import { Video } from '../../models/video';
import { videos } from './MOCK_DATA';
import { thumbnails } from './MOCK_DATA';

export function resolveVideo(){
	return function(target, key, descriptor){

		return mock("resolveVideo", target, key, descriptor, () => {

			let one_video = returnObjectOfFrom(Video, videos);
			one_video.thumbnails = randomizeString(thumbnails);

			return Observable.of(one_video)
		});
	}
}

export function resolveVideos(count=2){
	return function(target, key, descriptor){

		return mock("resolveVideos", target, key, descriptor, () => {

			let list_of_videos = returnArrayOfVideos(count);

			return Observable.of(list_of_videos);
		});
	}
}

export function returnArrayOfVideos(count=2){

	let list_of_videos = returnArrayOfFrom(Video, videos, count);
	list_of_videos.map(current => {

		current.thumbnails = randomizeString(thumbnails);
	})

	return list_of_videos;
}