import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchVideoRoutingModule } from './search-video-routing.module';
import { SearchVideoComponent } from './search-video.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [SearchVideoComponent],
  imports: [
    CommonModule,
    SearchVideoRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class SearchVideoModule { }
