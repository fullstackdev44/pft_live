import { User } from './user';

export class Category {

  _id: string;

  title: string;

  profile_image: string;

  meta: {
    videos: Number
  };

  // view
  selected_filter: boolean;

  created: Date;
  modified: Date;
}
