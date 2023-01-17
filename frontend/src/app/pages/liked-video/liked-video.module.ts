import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LikedVideoRoutingModule } from './liked-video-routing.module';
import { LikedVideoComponent } from './liked-video.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [LikedVideoComponent],
  imports: [
    CommonModule,
    LikedVideoRoutingModule,
    SharedModule
  ]
})
export class LikedVideoModule { }
