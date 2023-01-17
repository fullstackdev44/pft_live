import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserAccountComponent } from './user-account.component';
import { UserDefaultComponent } from './user-default/user-default.component';
import { UserBlockedComponent } from './user-blocked/user-blocked.component';
import { UserChannelComponent } from './user-channel/user-channel.component';
import { UserContactComponent } from './user-contact/user-contact.component';
import { UserFavoriteComponent } from './user-favorite/user-favorite.component';
import { UserNotificationComponent } from './user-notification/user-notification.component';
import { UserPasswordComponent } from './user-password/user-password.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserSubscriptionsComponent } from './user-subscriptions/user-subscriptions.component';
import { UserVideosComponent } from './user-videos/user-videos.component';
import { UserLikedVideoComponent } from './user-liked-video/user-liked-video.component';
import { UserWatchLaterComponent } from './user-watch-later/user-watch-later.component';
import { UserPlaylistComponent } from './user-playlist/user-playlist.component';
import { UserHistoryComponent } from './user-history/user-history.component';
import { UserPurchasedVideoComponent } from './user-purchased-video/user-purchased-video.component';
import { UserPlaylistDetailComponent } from './user-playlist/user-playlist-detail/user-playlist-detail.component';
import { UserWithdrawalComponent } from './user-withdrawal/user-withdrawal.component';
import { UserLiveComponent } from './user-live/user-live.component';

const routes: Routes = [
  {
    path: '',
    component: UserAccountComponent,
    children: [
    	{
    		path: '',
    		component: UserDefaultComponent
    	},
    	{
    		path: 'blocked',
    		component: UserBlockedComponent
    	},
    	{
    		path: 'channel',
    		component: UserChannelComponent
    	},
    	{
    		path: 'contacts',
    		component: UserContactComponent
    	},
    	{
    		path: 'favorites',
    		component: UserFavoriteComponent
    	},
    	{
    		path: 'message',
				loadChildren: ()=>import('./user-message/user-message.module').then((model)=>model.UserMessageModule)
    	},
    	{
    		path: 'notifications',
    		component: UserNotificationComponent
    	},
    	{
    		path: 'password',
    		component: UserPasswordComponent
    	},
    	{
    		path: 'profile',
    		component: UserProfileComponent
    	},
    	{
    		path: 'subscriptions',
    		component: UserSubscriptionsComponent
    	},
    	{
    		path: 'videos',
    		component: UserVideosComponent
			},
			{
    		path: 'liked',
    		component: UserLikedVideoComponent
			},
			{
    		path: 'watch-later',
    		component: UserWatchLaterComponent
			},
			{
    		path: 'playlist',
    		component: UserPlaylistComponent
			},
			{
    		path: 'playlist-detail/:id',
    		component: UserPlaylistDetailComponent
			},
			{
    		path: 'history',
    		component: UserHistoryComponent
			},
			{
    		path: 'history/:report',
    		component: UserHistoryComponent
			},
			{
    		path: 'purchased',
    		component: UserPurchasedVideoComponent
			},
			{
    		path: 'withdrawal',
    		component: UserWithdrawalComponent
			},
			{
    		path: 'live',
    		component: UserLiveComponent
			}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserAccountRoutingModule { }
