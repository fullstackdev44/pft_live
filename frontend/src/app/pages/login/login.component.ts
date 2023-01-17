import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute, DefaultUrlSerializer } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HttpAuthenticationService } from '../shared/authentication/http-authentication.service';
import { TokenService } from '../shared/authentication/token.service';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
// import { AngularFireAuth } from 'angularfire2/auth';

declare var $: any;

@Component({
  selector: 'pft-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  login_success: string = "";
  login_error: string = "";

  utilisateur: Observable<firebase.User>;
  social_network_user: User = new User();

  private serializer = new DefaultUrlSerializer();

  constructor(
    private formBuilder: FormBuilder,
    private httpAuth: HttpAuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private renderer: Renderer2,
    // public afAuth: AngularFireAuth,
    private userService: UserService
  ) {

    this.loginForm = this.formBuilder.group({email: ['', [Validators.required, Validators.email]], password: ['', Validators.required]});
  }

  ngOnInit() {

    this.tokenService.decodeUserToken();

    if (this.tokenService.user) {

      if (localStorage.getItem('url') != (null || undefined)){
        const redirectUrl = this.serializer.parse(localStorage.getItem('url'));
        localStorage.removeItem('url');
        return this.router.navigateByUrl(redirectUrl);
      }

      return this.router.navigate(['/']);
    }

    this.showLoginModal();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.route.params.subscribe(
      params => {
        if (params.page_redirection) {
          this.returnUrl = '/' + params.page_redirection;
        }
      });
  }

  onSubmit() {

    this.submitted = true;
    this.login_error = "";
    // this.f.email.errors = "";

    // stop here if form is invalid
    if (this.loginForm.invalid){return}

    this.loading = true;
    const user = { email: this.f.email.value, password: this.f.password.value };

    this.httpAuth.signIn(user).subscribe(
      data => {

        this.login_success = 'Welcome to Project Fitness TV';
        this.hideLoginModal(undefined);

        this.tokenService.saveUserToken(data);
        this.tokenService.decodeUserToken();

        if (localStorage.getItem('url') != (null || undefined)) {
          this.returnUrl = decodeURI(localStorage.getItem('url'));
        }

        this.router.navigate([this.returnUrl]);
        window.location.reload();
      },
      error => {

        switch(error.type){
          case 'InvalidCredential':
            this.login_error = "Invalid credentials";
            break;
        }

        this.loading = false;
      });
    }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  showLoginModal(){
    // TODO: use service for this
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
    } else { $(".wrapper.hp_1").addClass("show_wrapper_class"); } // body.overlay .wrapper {display: block; }
    $(".signup_form").removeClass("show"); // hide sign up just in case
    $(".form_popup").addClass("opened");
    $(".login_form").addClass("show");
  }

  hideLoginModal(param: string){
    // TODO: use service for this
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
    if (param == 'clearAction') {
      if (localStorage.getItem('action') != (null || undefined) ) {
        localStorage.removeItem('action');
        localStorage.removeItem('params');
        localStorage.removeItem('url');
        localStorage.removeItem('reloaded');
      }
    }
    this.router.navigate(['/']);
  }

  // used for social login
  /*loginFacebook() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then((data)=> {
      this.utilisateur = this.afAuth.authState;
      this.utilisateur.subscribe((auth) => {
        if (auth == null) {
          this.router.navigate(['/login']);
        } else {
          if (this.social_network_user) {
            this.social_network_user.username = auth.displayName;
            this.social_network_user.full_name = auth.displayName;
            this.social_network_user.email = auth.email;
            this.social_network_user.facebook_id = auth.providerData[0].uid;
            this.userService.registerUserFromSocialNetwork(this.social_network_user).subscribe(
              result => {
                this.tokenService.saveUserToken(result);
                this.tokenService.decodeUserToken();
                this.social_network_user = null;
              },
              error => {
                console.log("Could not register user from facebook");
              });
            }
        }
      });
      this.hideLoginModal();
    });
  }

  loginTwitter() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider()).then((data)=> {
      this.utilisateur = this.afAuth.authState;
      this.utilisateur.subscribe((auth) => {
        if (auth == null) {
          this.router.navigate(['/login']);
        } else {
          if (this.social_network_user) {
            this.social_network_user.username = auth.displayName;
            this.social_network_user.full_name = auth.displayName;
            this.social_network_user.email = auth.email;
            this.social_network_user.twitter_id = auth.providerData[0].uid;
            this.userService.registerUserFromSocialNetwork(this.social_network_user).subscribe(
              result => {
                this.tokenService.saveUserToken(result);
                this.tokenService.decodeUserToken();
                this.social_network_user = null;
              },
              error => {
                console.log("Could not register user from twitter");
              });
          }
        }
      });
      this.hideLoginModal();
    });
  }*/

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

  goToSignup(){
    this.router.navigate(['/sign-up']);
  }

}
