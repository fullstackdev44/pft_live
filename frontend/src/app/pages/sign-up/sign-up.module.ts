import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule }   from '@angular/forms';

import { SignUpRoutingModule } from './sign-up-routing.module';
import { SignUpComponent } from './sign-up.component';
// import { AngularFireAuth } from 'angularfire2/auth';


@NgModule({
  exports: [SignUpComponent],
  declarations: [SignUpComponent],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  // providers: [AngularFireAuth]
  providers: []
})
export class SignUpModule { }
