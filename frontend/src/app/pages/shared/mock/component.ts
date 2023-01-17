

// Class
export class CommonComponent {

	constructor(){}

	initData = function(reference, observable, callback=null, notifyOnSuccess=false, notifyOnError=true, override=false): any {

		return observable.subscribe(
			data => {

				if(override){
					reference = data;
				}
				else if(reference){
					for(let key in data){
						reference[key] = data[key];
					}
				}

				if(notifyOnSuccess){
					this.notifyUser("success");
				}

				if(callback){
					return callback();
				}
			},
			error => {

				this.handleError(error, notifyOnError);

				if(callback){
					return callback();
				}
			});
	}

	// process

	handleError = function(error, notifyOnError) {

		if(notifyOnError){
			this.notifyUser("danger", error, error);
		}
	}

	notifyUser = function(type, message, object){
		// console.log("implement user notification for errors");
	}
}
