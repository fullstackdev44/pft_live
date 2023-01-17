import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../shared/services/user.service';

import { MustMatch } from '../shared/helpers/must-match.validator';

declare var $: any;

@Component({
  selector: 'pft-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  token = '';
  success = false;
  message = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.showResetPasswordModal();

    this.resetPasswordForm = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', Validators.required]
    }, {
        validator: MustMatch('password', 'confirm_password')
    });

    this.activatedRoute.params.subscribe(
      param => {
        this.token = param.token;
      }, error => {
        console.log(error);
      }
    );
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.resetPasswordForm.value.token = this.token;

    this.userService.resetPassword(this.resetPasswordForm.value).subscribe(
      data => {
        this.success = true;
        this.message = 'Password updated successfully!';
      },
      error => {
        this.message = 'Could not update the password';
        this.loading = false;
      });
  }

  showResetPasswordModal() {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $('.login_form').removeClass('show');
    $('.form_popup').addClass('opened');
    $('.signup_form').addClass('show');
  }

  hideResetPasswordModal() {
    this.renderer.removeClass(document.body, 'overlay');
    $('.form_popup').removeClass('opened');
    $('.signup_form').removeClass('show');
    $('.login_form').removeClass('show');
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
