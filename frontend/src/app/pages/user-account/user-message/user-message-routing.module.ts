import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageDefaultComponent } from './message-default/message-default.component';
import { MessageDeletedComponent } from './message-deleted/message-deleted.component';
import { MessageInboxComponent } from './message-inbox/message-inbox.component';
import { MessageSentComponent } from './message-sent/message-sent.component';

const routes: Routes = [
  {
    path: '',
    component: MessageDefaultComponent
  },
  {
    path: 'deleted',
    component: MessageDeletedComponent
  },
  {
    path: 'inbox',
    component: MessageInboxComponent
  },
  {
    path: 'inbox/:message_id',
    component: MessageInboxComponent
  },
  {
    path: 'sent',
    component: MessageSentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserMessageRoutingModule { }
