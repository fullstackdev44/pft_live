import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { PopularRoutingModule } from './popular-routing.module';

import { PopularComponent } from './popular.component';

@NgModule({
  declarations: [PopularComponent],
  imports: [
    CommonModule,
    PopularRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class PopularModule { }
