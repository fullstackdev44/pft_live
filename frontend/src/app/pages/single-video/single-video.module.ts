import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SingleVideoRoutingModule } from './single-video-routing.module';

import { SharedModule } from '../shared/shared.module';

import { SingleVideoComponent } from './single-video.component';

@NgModule({
  declarations: [SingleVideoComponent],
  imports: [
    CommonModule,
    SingleVideoRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class SingleVideoModule { }
