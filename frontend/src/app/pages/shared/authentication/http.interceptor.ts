import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { TokenService } from './token.service';
import { environment } from '../../../../environments/environment';

// Http interceptor : intercept every http query and add Token to the header

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {

    constructor(
      public token: TokenService,
      private router: Router) {}

    intercept(req: HttpRequest < any > , next: HttpHandler): Observable < HttpEvent < any >> {
      const BACKEND_URL = environment.config.API_BASE_URL;

      // Only add token for project fitness backend URL
      if (req.url.startsWith(BACKEND_URL)) {
        const dupReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + this.token.getUserToken()) });
        return next.handle(dupReq)
          .catch(
            error => {
              if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                  this.token.logOut();
                  this.router.navigate(['/login']);
                }
              }

              return Observable.throwError(error);
            });
      }
      else{
        return next.handle(req);
      }
    }
}
