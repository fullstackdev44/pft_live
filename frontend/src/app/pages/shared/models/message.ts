import { User } from './user';

export class Message {

  _id: string;

  sender: any;
  receiver: User[] | any = [];
  content: string;
  object: string;
  status: string;

  created: Date;
  modified: Date;
}
