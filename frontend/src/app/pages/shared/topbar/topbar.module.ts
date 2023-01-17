import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared.module';

import { TopbarComponent } from './topbar.component';

import { FormsModule } from '@angular/forms';
import { LoginModule } from '../../login/login.module';
import { SignUpModule } from '../../sign-up/sign-up.module';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ChatService } from '../services/chat.service';
import { environment } from '../../../../environments/environment';

const SOCKET_CONF: SocketIoConfig = { url: environment.config.API_BASE_URL, options: {} };

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        SharedModule,
        FormsModule,
        LoginModule,
        SignUpModule,
        SocketIoModule.forRoot(SOCKET_CONF)
    ],
    providers: [ChatService],
    declarations: [
      TopbarComponent
    ],
    exports: [TopbarComponent]
})

export class TopbarModule {}
