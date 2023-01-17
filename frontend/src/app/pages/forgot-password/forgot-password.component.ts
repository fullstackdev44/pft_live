import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CommonComponent } from '../shared/mock/component';

import { UserService } from '../shared/services/user.service';

import { MustMatch } from '../shared/helpers/must-match.validator';

declare var $: any;

@Component({
  selector: 'pft-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  message = '';
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2) {
  }

  ngOnInit() {
    this.showForgotPasswordModal();

    this.forgotPasswordForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.forgotPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
        return;
    }

    this.loading = true;
console.log(this.forgotPasswordForm.value);
    this.userService.forgotPassword(this.forgotPasswordForm.value).subscribe(
      data => {
        this.message = 'We have send a link to your email to recover your password';
        this.loading = false;
        this.success = true;
      },
      error => {
        this.message = 'This email can\'t be found on our database';
        this.loading = false;
      });
  }

  showForgotPasswordModal(){
    // TODO: use service for this
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".login_form").removeClass("show"); // hide login
    $(".form_popup").addClass("opened");
    $(".signup_form").addClass("show");
  }

  hideForgotPasswordModal(){
    // TODO: use service for this
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
    this.router.navigate(['/']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}

