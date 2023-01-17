import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivateAccountComponent } from './activate-account.component';


const routes: Routes = [
  {
    path: '',
    component: ActivateAccountComponent
  }/*,
  {
    path: ':token',
    component: ActivateAccountComponent
  }*/
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivateAccountRoutingModule { }
