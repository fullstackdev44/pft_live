import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CommonComponent } from '../shared/mock/component';

import { UserService } from '../shared/services/user.service';
import { TokenService } from '../shared/authentication/token.service';

import { MustMatch } from '../shared/helpers/must-match.validator';
// import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../shared/models/user';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

declare var $: any;

@Component({
  selector: 'pft-sign-up',
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent extends CommonComponent implements OnInit {

  password_confirm: string;
  same_password: boolean = true;

  registerForm: FormGroup;
  loading = false;
  submitted = false;

  utilisateur: Observable<firebase.User>;
  social_network_user: User = new User();

  user_already_exist: boolean = false;
  // username_already_exist: boolean = false;
  email_already_exist: boolean = false;

  public sign_up_success: boolean = false;
  public email_for_sign_up: string = undefined;
  public sending_email_error: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    private renderer: Renderer2,
    // public afAuth: AngularFireAuth
  ) {
    super();
  }

  ngOnInit() {

    if (this.tokenService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    else {
      
      this.showSignUpModal();

      this.registerForm = this.formBuilder.group({
          full_name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          // username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]*$/)]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirm_password: ['', Validators.required]
      },{
          validator: MustMatch('password', 'confirm_password')
      });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }

    this.loading = true;
    this.userService.signUp(this.registerForm.value).subscribe(
      data => {
        this.email_already_exist = false;
        // this.username_already_exist = false;
        this.user_already_exist = false;
        // this.hideSignUpModal();
        // this.router.navigate(['/login']);
        this.sign_up_success = true;
        this.email_for_sign_up = this.registerForm.value.email;
      },
      error => {
        console.log("Could not register the user");
        this.loading = false;
        if (error['error'] && error['error'] == 'email already exist!') {
          this.email_already_exist = true;
          // this.username_already_exist = false;
          this.user_already_exist = false;

        /*} else if (error['error'] && error['error'] == 'username already exist!') {
          this.email_already_exist = false;
          this.username_already_exist = true;
          this.user_already_exist = false;*/
        } else if (error['error'] && error['error'] == 'email or username already exist!'){
          this.email_already_exist = false;
          // this.username_already_exist = false;
          this.user_already_exist = true;
        } else if (error['error'] && error['error'] == 'email error') {
          this.sending_email_error = true;
        }
      })
  }

  showSignUpModal(){
    // TODO: use service for this
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
    } else { $(".wrapper.hp_1").addClass("show_wrapper_class"); }
    $(".login_form").removeClass("show"); // hide login
    $(".form_popup").addClass("opened");
    $(".signup_form").addClass("show");
  }

  hideSignUpModal(){
    // TODO: use service for this
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
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
      this.hideSignUpModal();
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
      this.hideSignUpModal();
    });
  }*/

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}
