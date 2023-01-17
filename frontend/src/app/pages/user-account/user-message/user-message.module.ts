import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { UserMessageRoutingModule } from './user-message-routing.module';

import { MessageDefaultComponent } from './message-default/message-default.component';
import { MessageInboxComponent } from './message-inbox/message-inbox.component';
import { MessageSentComponent } from './message-sent/message-sent.component';
import { MessageDeletedComponent } from './message-deleted/message-deleted.component';

@NgModule({
  declarations: [MessageDefaultComponent, MessageInboxComponent, MessageSentComponent, MessageDeletedComponent],
  imports: [
    CommonModule,
    UserMessageRoutingModule,
    FormsModule
  ]
})
export class UserMessageModule { }
