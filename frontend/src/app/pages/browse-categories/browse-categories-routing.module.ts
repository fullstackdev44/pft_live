import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrowseCategoriesComponent } from './browse-categories.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';

const routes: Routes = [
  {
    path: '',
    component: BrowseCategoriesComponent
  },
  {
    path: ':id',
    component: CategoryDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrowseCategoriesRoutingModule { }
