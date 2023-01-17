import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaylistVideoRoutingModule } from './playlist-video-routing.module';
import { PlaylistVideoComponent } from './playlist-video.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [PlaylistVideoComponent],
  imports: [
    CommonModule,
    PlaylistVideoRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class PlaylistVideoModule { }
