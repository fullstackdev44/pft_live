import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule }   from '@angular/forms';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
// import { AngularFireAuth } from 'angularfire2/auth';


@NgModule({
  exports: [LoginComponent],
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule
  // ], providers: [AngularFireAuth]
  ], providers: []
})
export class LoginModule { }
