import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { UserAccountRoutingModule } from './user-account-routing.module';

import { UserAccountComponent } from './user-account.component';
import { UserVideosComponent } from './user-videos/user-videos.component';
import { UserBlockedComponent } from './user-blocked/user-blocked.component';
import { UserPasswordComponent } from './user-password/user-password.component';
import { UserSubscriptionsComponent } from './user-subscriptions/user-subscriptions.component';
import { UserNotificationComponent } from './user-notification/user-notification.component';
import { UserContactComponent } from './user-contact/user-contact.component';
import { UserDefaultComponent } from './user-default/user-default.component';
import { UserFavoriteComponent } from './user-favorite/user-favorite.component';
import { UserChannelComponent } from './user-channel/user-channel.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserWatchLaterComponent } from './user-watch-later/user-watch-later.component';
import { UserHistoryComponent } from './user-history/user-history.component';
import { UserLikedVideoComponent } from './user-liked-video/user-liked-video.component';
import { UserPurchasedVideoComponent } from './user-purchased-video/user-purchased-video.component';
import { UserPlaylistComponent } from './user-playlist/user-playlist.component';
import { UserPlaylistDetailComponent } from './user-playlist/user-playlist-detail/user-playlist-detail.component';
import { UserWithdrawalComponent } from './user-withdrawal/user-withdrawal.component';
import { UserLiveComponent } from './user-live/user-live.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [
    UserAccountComponent,
    UserVideosComponent,
    UserBlockedComponent,
    UserPasswordComponent,
    UserSubscriptionsComponent,
    UserNotificationComponent,
    UserContactComponent,
    UserDefaultComponent,
    UserFavoriteComponent,
    UserChannelComponent,
    UserProfileComponent,
    UserWatchLaterComponent,
    UserHistoryComponent,
    UserLikedVideoComponent,
    UserPurchasedVideoComponent,
    UserPlaylistComponent,
    UserPlaylistDetailComponent,
    UserWithdrawalComponent,
    UserLiveComponent
  ],
  imports: [
    CommonModule,
    UserAccountRoutingModule,
    SharedModule,
    FormsModule,
    BsDatepickerModule.forRoot()
  ]
})
export class UserAccountModule { }
