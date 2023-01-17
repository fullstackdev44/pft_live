import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { BrowseCategoriesRoutingModule } from './browse-categories-routing.module';

import { BrowseCategoriesComponent } from './browse-categories.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';

@NgModule({
  declarations: [BrowseCategoriesComponent, CategoryDetailComponent],
  imports: [
    CommonModule,
    BrowseCategoriesRoutingModule,
    SharedModule
  ]
})
export class BrowseCategoriesModule { }
