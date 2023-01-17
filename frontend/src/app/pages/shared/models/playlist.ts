import { User } from './user';
import { Video } from './video';

export class Playlist {

  _id: string;

  videos: Video[] = [];
  title: string;
  detail: string;
  owner: User;
  channel: any;

  meta: {
    views: number;
  };

  // Copied from others api YouTube or Vimeo (or just a suggestion)
  thumbnail: string;
  update_date: Date;

  created: Date | string;
  modified: Date;
}
