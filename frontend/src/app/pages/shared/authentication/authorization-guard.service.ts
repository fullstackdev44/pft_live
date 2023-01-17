import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateChild } from '@angular/router';
import { ActivatedRouteSnapshot, CanActivate} from '@angular/router';

import { TokenService } from './token.service';

import * as decode from 'jwt-decode';

// Angular routes guard
// Declare this to your app.module as a service provider
// And use it as 'canActivateChild' guard in your app.routing module

@Injectable()
export class AuthorizationGuardService implements CanActivateChild, CanActivate {

    constructor(
      private token: TokenService,
      private router: Router
    ) {

    }

    canActivateChild(snap: ActivatedRouteSnapshot): boolean {
      return this.checkLoginAndAuthorization();
    }

    canActivate(snap: ActivatedRouteSnapshot): boolean {
      //return this.checkLoginAndAuthorization(snap.data.auth_level);
      return this.checkLoginAndAuthorization();
    }

    // ------------------------------------
    // Make sure user is logged in
    // is authorized to access the route
    // ------------------------------------
    checkLoginAndAuthorization(): boolean {

        const isLoggedIn = this.token.isLoggedIn();

        if (!isLoggedIn) {
          this.router.navigate(['/login']);
          return false;
        }

        const token = localStorage.getItem('token');
        const tokenPayload = decode(token);

        return true;
    }

}
