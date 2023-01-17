import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { mock, returnObjectOfFrom, returnArrayOfFrom } from '../common';
import { returnArrayOfVideos } from '../video';

import { Playlist } from '../../models/playlist';
import { playlists } from './MOCK_DATA';

export function resolvePlaylist(){
	return function(target, key, descriptor){

		return mock("resolvePlaylist", target, key, descriptor, () => Observable.of(returnObjectOfFrom(Playlist, playlists)));
	}
}

export function resolvePlaylists(count=2){
	return function(target, key, descriptor){

		return mock("resolvePlaylists", target, key, descriptor, () => Observable.of(returnArrayOfFrom(Playlist, playlists, count)));
	}
}

export function resolvePlaylistsWithVideos(count=2){
	return function(target, key, descriptor){

		return mock("resolvePlaylistsWithVideos", target, key, descriptor, () => {

			let playlists_list = returnArrayOfFrom(Playlist, playlists, count);
			playlists_list.map(current => {

				current.videos = returnArrayOfVideos(4);
			})

			return Observable.of(playlists_list);
		})
	}
}