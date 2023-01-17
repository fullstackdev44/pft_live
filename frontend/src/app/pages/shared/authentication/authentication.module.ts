import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpAuthenticationService } from './http-authentication.service';
import { TokenService } from './token.service';
import { AuthorizationGuardService } from './authorization-guard.service';
import { HttpAuthInterceptor } from './http.interceptor';
import { AuthenticationComponent } from './authentication.component';

// Module descriptor
// Import this in your app.module

@NgModule({
    declarations: [AuthenticationComponent],
    imports: [
        CommonModule
    ],
    providers: [
        HttpAuthenticationService,
        TokenService,
        AuthorizationGuardService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpAuthInterceptor,
            multi: true,
        }
    ],
    exports: [
        AuthenticationComponent
    ]
})
export class AuthenticationModule {}
