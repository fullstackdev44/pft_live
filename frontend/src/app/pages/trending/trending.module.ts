import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { TrendingRoutingModule } from './trending-routing.module';

import { TrendingComponent } from './trending.component';

@NgModule({
  declarations: [TrendingComponent],
  imports: [
    CommonModule,
    TrendingRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class TrendingModule { }
