import { Playlist } from './playlist';
import { Video } from './video';
import { User } from './user';
import { Product } from './product';

export class Channel {

  _id: string;

  title: string;
  avatar_color: string;
  avatar_card: string;
  detail: string;
  owner: User;
  verified: boolean;
  profile_image: string;
  profile_image_offset: number;
  profile_image_height: number;
  profile_image_width: number;

  subscribers: User[];
  
  meta: {
    // May be this section should be removed as user can't like or dislike a channel
    // start of the section
    likes: number;
    dislikes: number;
    // end of the section

    views: number;
    subscribers: number;
    videos: number;
  };

  // view
  recent_videos: Video[] = [];
  popular_videos: Video[] = [];
  videos: Video[] = [];
  current_live: Video = new Video();
  mapped_future_lives: any = {};
  live_videos: Video[] = [];
  recent_donators: User[] = [];

  // Copied from others api YouTube or Vimeo (or just a suggestion)
  playlists: Playlist[] = [];
  featured_videos: Video[] = [];
  featured_channels: Channel[] = [];
  featured_products: Product[] = [];
  type: string;

  links: any[];
  business_inquiries: any[];

  // Make channel active or inactive
  active: boolean; 

  created: Date;
  modified: Date;
}
