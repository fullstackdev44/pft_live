import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, randomizeString, returnObjectOfFrom, returnArrayOfFrom } from '../common';
import { returnArrayOfUrls } from '../misc';

import { Channel } from '../../models/channel';
import { channels } from './MOCK_DATA';
import { thumbnails } from './MOCK_DATA';

export function resolveChannel(){
	return function(target, key, descriptor){

		return mock("resolveChannel", target, key, descriptor, () => {

			let one_channel = returnObjectOfFrom(Channel, channels);
			one_channel.profile_image = randomizeString(thumbnails);
			one_channel.links = returnArrayOfUrls(5);
			one_channel.business_inquiries = returnArrayOfUrls(3);

			return Observable.of(one_channel);
		});
	}
}

export function resolveChannels(count=2){
	return function(target, key, descriptor){

		return mock("resolveChannels", target, key, descriptor, () => {

			let channels_list = returnArrayOfFrom(Channel, channels, count);
			channels_list.map(current => {

				current.profile_image = randomizeString(thumbnails);
			});

			return Observable.of(channels_list);
		});
	}
}