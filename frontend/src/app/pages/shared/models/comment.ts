import { User } from './user';
import { Video } from './video';

export class Comment {

  _id: string;

  user_id: any;
  video_id: Video;
  comment: string;
  parent: any;

  meta: {
    likes: any;
    dislikes: any;
  };

  edited: Boolean = false;

  created: Date;
  modified: Date;
}
