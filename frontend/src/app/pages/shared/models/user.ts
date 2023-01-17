import { Channel } from './channel';
import { Video } from './video';
import { Playlist } from './playlist';

export class User {

  _id: string;

  // User info
  full_name: string;
  //last_name: string;
  //middle_name: string;
  gender: 'N/A';
  dob: Date;
  country: string;
  inbox: number;

  pro: boolean;

  // User credentials and social media
  email: string;
  username: string;
  password: string;
  registration_date: Date;
  last_login: Date;
  facebook_id: string;
  google_id: string;
  twitter_id: string;
  subscribed_channels: any[] = [];
  blocked_users: any[] = [];
  account_type: string;
  contacts: User[] = [];
  notifications: any[] = [];

  phone_number: string;
  avatar: string;
  avatar_card: string;
  avatar_color: string;

  // According to Eddy correction on google docs model
  favorite_videos: any[] = [];
  liked_videos: any[] = [];
  disliked_videos: any[] = [];

  // May be it's better if we add history here too
  videos_history: Video[] = [];
  watch_later_videos: Video[] = [];
  continue_watching_videos: Video[] = [];
  paused_videos: Video[] = [];
  recommendations: Video[] = [];
  search_terms_history: [{term: string, date: Date}];
  report_history: any[] = [];

  playlists: Playlist[] = [];
  purchased_videos: Video[] = [];

  money: number;

  // view
  channel: string;

  created: Date;
  modified: Date;
}
