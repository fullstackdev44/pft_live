export class Product{

	_id: string;
	name: string;
	link: string;
	website_logo: string;

	image: string;

	price: number;

	discount: any = {
		code: "",
		discount: 0
	};

	created: Date;
	modified: Date;
}
