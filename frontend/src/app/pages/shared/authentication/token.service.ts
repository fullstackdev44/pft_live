import { Injectable } from '@angular/core';
import * as decode from 'jwt-decode';
import { User } from '../models/user';
// import { AngularFireAuth } from 'angularfire2/auth';

const data_keys = {
    user_token: "token",
    user_subscriptions: "subs",
    user_details: "prop"
}

@Injectable()
export class TokenService {

    public user: User;

    // constructor(public afa: AngularFireAuth) {}
    constructor() {}

    public saveUserToken(token_value: string) {
        try{
            localStorage.setItem(data_keys.user_token, token_value);    
        }
        catch(e){
            console.log("Exception from localStorage (saveUserToken): ");
            console.log(e);
        }
    }

    public getUserToken(): string{
        return localStorage.getItem(data_keys.user_token);
    }

    public decodeUserToken(): any {

        if(this.user){
            return this.user;
        }

        const token = this.getUserToken();

        if (!token) {
            this.user = null;
            return null;
        }

        this.user = decode(token);
        return this.user;
    }

    public isLoggedIn(): boolean {

        const tokenPayload = this.decodeUserToken();

        if (!tokenPayload) {
            return false;
        }

        // check for never expiring token
        if (typeof tokenPayload.exp === 'undefined') {
            return true;
        }

        const currrent_time = new Date().getTime() / 1000;
        if (tokenPayload.exp <= currrent_time) {
            this.logOut();
            return false;
        }

        return tokenPayload.exp > currrent_time;
    }

    public logOut(): boolean {

        this.user = null;
        localStorage.removeItem(data_keys.user_token);
        localStorage.removeItem(data_keys.user_subscriptions);
        localStorage.removeItem('action');
        localStorage.removeItem('params');
        localStorage.removeItem('url');
        localStorage.removeItem('reloaded');
        // this.afa.auth.signOut();
        return true;
    }

    public getUserSubscriptions(){

        const subscription_token = localStorage.getItem(data_keys.user_subscriptions);

        if(!subscription_token){
            return null;
        }

        const subscriptions = JSON.parse(atob(subscription_token));
        if(!subscriptions){
            return [];
        }

        return subscriptions;
    }

    public saveUserSubscriptions(subscriptions_array){
        try{
            localStorage.setItem(data_keys.user_subscriptions, btoa(JSON.stringify(subscriptions_array)));
        }
        catch(e){
            console.log("Exception from localStorage (saveUserSubscriptions): ");
            console.log(e);
        }
    }
}
