import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';

import { environment } from '../../../../environments/environment';
const config = environment.config;

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

// Http service to perform login operation
// import this to your login.component and use signIn() to log user in

@Injectable()
export class HttpAuthenticationService {

    private authUrl = config.API_BASE_URL + '/user';

    constructor(private http: HttpClient) {}

    signIn(user: any): Observable < any > {
        const that = this;
        return this.http.post(that.authUrl + '/login', user)
            .map(that.extractData)
            .catch(that.handleError);
    }

    /*
    getSignedInUser(): Observable < any > {
        const that = this;
        return this.http.get(that.authUrl + '/me')
            .map(that.extractData)
            .catch(that.handleError);
    }
    */
   
    getJWTToken() {
      return localStorage.getItem('token');
    }

    private extractData(res: any) {
        return res.data || {};
    }

    private handleError(error: HttpErrorResponse | any) {
      let errMsg: string;
      let displayerrMsg: string;

      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
        const err = error.error.message || error.error || error;
        displayerrMsg = err.split('"')[3];
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);

        errMsg = error.message ? error.message : error.toString();
        displayerrMsg = errMsg;
      }

      // return an observable with a user-facing error message
      return Observable.throwError(error.error);
    }
}
