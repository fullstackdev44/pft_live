import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { MovieRoutingModule } from './movie-routing.module';

import { MovieComponent } from './movie.component';

@NgModule({
  declarations: [MovieComponent],
  imports: [
    CommonModule,
    MovieRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class MovieModule { }
