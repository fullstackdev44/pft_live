import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { VideoService } from '../shared/services/video.service';
import { ChannelService } from '../shared/services/channel.service';

import { Video } from '../shared/models/video';
import { Channel } from '../shared/models/channel';
import { UserService } from '../shared/services/user.service';
import { TokenService } from '../shared/authentication/token.service';
import { User } from '../shared/models/user';
import { Router } from '@angular/router';

declare var $: any;
@Component({
	selector: 'pft-live-video',
	templateUrl: './live-video.component.html',
	styleUrls: ['./live-video.component.css']
})
export class LiveVideoComponent extends CommonComponent implements OnInit {

	public lives: Video[] = [];
	public popular_lives: Video[] = [];
	public recent_lives: Video[] = [];
	public upcomming_lives: Video[] = [];
	public show_hide_section: boolean[] = [true, true, true, true];
	public video_info = {title: '', description: ''};
	public user_subscriptions: any[] = [];
	public user: User = new User();

	constructor(
		private liveService: VideoService,
		private channelService: ChannelService,
		private renderer: Renderer2,
		private tokenService: TokenService,
		private userService: UserService,
		private router: Router
	) {
		super();
	}

	ngOnInit() {
		if(this.tokenService.user && this.tokenService.user._id) {
			this.user = this.tokenService.user;
			this.initData(this.user_subscriptions, this.userService.getSubscriptions());
		}

		var curr_recent = new Date;
		var start_recent = new Date(curr_recent.setDate(curr_recent.getDate() - 2));
		start_recent.setHours(0, 0, 0);
		var end_recent = new Date();

		var curr_upcomming = new Date;
		var start_upcomming = new Date();
		var end_upcomming = new Date(curr_upcomming.setDate(curr_upcomming.getDate() + 2));
		end_upcomming.setHours(23, 59, 59);

		this.initData(this.lives, this.liveService.getActualLives());
		this.initData(this.popular_lives, this.liveService.getPopularLives());
		this.initData(this.recent_lives, this.liveService.getRecentLives(start_recent, end_recent));
		this.initData(this.upcomming_lives, this.liveService.getUpcommingLives(start_upcomming, end_upcomming, 12));
	}

	showVideoInfoModal(video: Video){

    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#video_info_modal").addClass("opened");
    $("#video_info_form").addClass("show");
    this.video_info.title = video.title;
    this.video_info.description = video.description;
  }

  hideVideoInfoModal(){

    this.renderer.removeClass(document.body, 'overlay');
    $("#video_info_modal").removeClass("opened");
    $("#video_info_form").removeClass("show");
    this.video_info.title = '';
    this.video_info.description = '';
	}

	userIsSubscribedTo(channel_id: string){
    return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
	}

	navigateTo(live: any, user: any) {
		if ( live.user_id == user._id ) {
			if(live._id) this.router.navigate(['/live/go/' + live._id]);
		} else {
			if(live._id) this.router.navigate(['/live/' + live._id]);
		}
	}

}
