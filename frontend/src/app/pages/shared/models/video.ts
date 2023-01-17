import { User } from './user';
import { Channel } from './channel';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Category } from './category';
import { Product } from './product';

export class Video {

  _id: string;

  title: string;
  description: string;
  orientation: string;
  active: boolean;
  source_id: string;
  monetize: boolean = false;
  privacy_settings: string = 'PUBLIC';
  license: string = 'STANDARD';
  tags: string = "";
  products: Product[] = [];
  categories: Category[] = [];
  size: number;
  user_id: string; //User;
  comments: Comment[];
  meta: {
    likes: any;
    dislikes: any;
    views: number;
  };

  duration: number;
  resolution: string;
  channel_id: Channel;

  // Copied from others api YouTube or Vimeo (just a suggestion)
  thumbnail: string;
  broadcast_live: boolean;
  authorized_users: User[];
  type: string;
  video_type: string;

  price: number;

  upload_status: string;

  // view
  vimeo: any;
  safe_url: SafeResourceUrl;
  is_favorite: boolean = false;
  is_liked: boolean = false;
  is_disliked: boolean = false;
  is_to_watch_later: boolean = false;

  // We must think on how to detect a duplicate video on upload
  // It seems youtube compare pixel and bitrate of their video
  // to the uploaded video so then can check if it is duplicate
  // and they don't display the uploaded video who is duplicate

  // It seems there's a menu Movies in template, do we need to upload movie?
  // may be it's just a link for the movie?

  // I see, I think youtube or user just categorized/taged long video as movie

  // view
  current_time: number;
  featured: boolean = false;

  // Live video info
  live_status: boolean;
  live_info: {
    start: Date;
    end: Date;
    auto_start: boolean;
    status: string;
    live_thumbnail: string;
    roomName: string;
    maxNoPeople: number;
  };

  created: Date;
  modified: Date;
}
