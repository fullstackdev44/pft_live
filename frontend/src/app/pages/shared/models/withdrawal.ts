import { User } from './user';

export class Withdrawal{

	_id: string;

  amount: number;
  user: User;
  paypal_email: string;
  note: string;
  status: string;

	created: Date;
	modified: Date;
}
