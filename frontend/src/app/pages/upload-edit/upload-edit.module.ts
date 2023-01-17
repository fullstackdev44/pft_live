import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { UploadEditRoutingModule } from './upload-edit-routing.module';
import { UploadEditComponent } from './upload-edit.component';


@NgModule({
  declarations: [UploadEditComponent],
  imports: [
    CommonModule,
    SharedModule,
    UploadEditRoutingModule,
    FormsModule
  ]
})
export class UploadEditModule { }
