import { Channel } from './channel';
import { Comment } from './comment';

export class Notify {

  _id: string;

  sender: any;
  receiver: any | string;
  status: string;

  type: string;

	// content changes by type field value:
	comment: Comment | string;
  subscription_channel: Channel | string;
  sender_channel: Channel | string;
	donation_payment: any;

  created: Date;
  modified: Date;
}
