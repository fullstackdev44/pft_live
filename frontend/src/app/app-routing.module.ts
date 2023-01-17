import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: './pages/home/home.module#HomeModule'
  },
  {
    path: 'activate-account/:token',
    loadChildren: './pages/activate-account/activate-account.module#ActivateAccountModule'
  },
  {
    path: 'upload-edit',
    loadChildren: './pages/upload-edit/upload-edit.module#UploadEditModule'
  },
  {
    path: 'upload-edit/:video_id',
    loadChildren: './pages/upload-edit/upload-edit.module#UploadEditModule'
  },
  {
    path: 'upload-video',
    loadChildren: './pages/upload-video/upload-video.module#UploadVideoModule'
  },
  {
    path: 'video/:video_id',
    loadChildren: './pages/single-video/single-video.module#SingleVideoModule'
  },
  {
    path: 'channels',
    loadChildren: './pages/channel/channel.module#ChannelModule'
  },
  {
    path: 'categories',
    loadChildren: './pages/browse-categories/browse-categories.module#BrowseCategoriesModule'
  },
  {
    path: 'history',
    loadChildren: './pages/history/history.module#HistoryModule'
  },
  {
    path: 'live',
    loadChildren: './pages/live-video/live-video.module#LiveVideoModule'
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginModule'
  },
  {
    path: 'login/:page_redirection',
    loadChildren: './pages/login/login.module#LoginModule'
  },
  {
    path: 'search-video',
    loadChildren: './pages/search-video/search-video.module#SearchVideoModule'
  },
  {
    path: 'sign-up',
    loadChildren: './pages/sign-up/sign-up.module#SignUpModule'
  },
  {
    path: 'subscriptions',
    loadChildren: './pages/updates-from-subs/updates-from-subs.module#UpdatesFromSubsModule'
  },
  {
    path: 'user-account',
    loadChildren: ()=>import('./pages/user-account/user-account.module').then((model)=>model.UserAccountModule)
  },
  {
    path: 'watch-later',
    loadChildren: './pages/watch-later/watch-later.module#WatchLaterModule'
  },
  {
    path: 'liked-video',
    loadChildren: './pages/liked-video/liked-video.module#LikedVideoModule'
  },
  {
    path: 'playlist/:playlist_id',
    loadChildren: './pages/playlist-video/playlist-video.module#PlaylistVideoModule'
  },
  {
    path: 'playlist/:playlist_id/:video_id',
    loadChildren: './pages/playlist-video/playlist-video.module#PlaylistVideoModule'
  },
  {
    path: 'history',
    loadChildren: './pages/history/history.module#HistoryModule'
  },
  {
    path: 'trending',
    loadChildren: './pages/trending/trending.module#TrendingModule'
  },
  {
    path: 'popular',
    loadChildren: './pages/popular/popular.module#PopularModule'
  },
  {
    path: 'movie',
    loadChildren: './pages/movie/movie.module#MovieModule'
  },
  {
    path: 'reset-password/:token',
    loadChildren: './pages/reset-password/reset-password.module#ResetPasswordModule'
  },
  {
    path: 'forgot-password',
    loadChildren: './pages/forgot-password/forgot-password.module#ForgotPasswordModule'
  },
  {
    path: 'payment/:video_source_id',
    loadChildren: './pages/payment/payment.module#PaymentModule'
  },
  {
    path: 'payment/channel/:channel_id',
    loadChildren: './pages/payment/payment.module#PaymentModule'
  },
  {
    path: 'payment/live/:live_id',
    loadChildren: './pages/payment/payment.module#PaymentModule'
  },
  {
    path: 'payment/:video_source_id/:donation',
    loadChildren: './pages/payment/payment.module#PaymentModule'
  },
  {
    path: 'payment/:live_video_id/:live_donation/:is_live_param',
    loadChildren: './pages/payment/payment.module#PaymentModule'
  },
  { path: 'page', loadChildren: () => import('./pages/static/static.module').then(m => m.StaticModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
