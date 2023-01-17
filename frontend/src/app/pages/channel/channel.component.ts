import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { TokenService } from '../shared/authentication/token.service';
import { UserService } from '../shared/services/user.service';
import { ChannelService } from '../shared/services/channel.service';

import { Channel } from '../shared/models/channel';

@Component({
	selector: 'pft-channel',
	templateUrl: './channel.component.html'
})
export class ChannelComponent extends CommonComponent implements OnInit {

	public popular_channels: Channel[] = [];
	public trending_channels: Channel[] = [];
	public recent_channels: Channel[] = [];

	public user_subscriptions: any[] = [];

	public show_arrow: any[] = [];
  public skip_option: number[] = [0, 0, 0];
  private initial_value: boolean[] = [false, false, false];

	constructor(private channelService: ChannelService,
		private tokenService: TokenService,
		private userService: UserService) {
		super();
	}

	ngOnInit() {
		// override by those show_more() function
		/*this.initData(this.popular_channels, this.channelService.getPopularChannels());
		this.initData(this.trending_channels, this.channelService.getTrendingChannels());
		this.initData(this.recent_channels, this.channelService.getRecentChannels());*/

		this.show_more_popular_channel();
		this.show_more_trending_channel();
		this.show_more_recent_channel();

		this.tokenService.decodeUserToken();

		if(this.tokenService.user){
			this.initData(this.user_subscriptions, this.userService.getSubscriptions());
		}
	}

	userIsSubscribedTo(channel_id: string){
		return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
	}

	show_more_popular_channel() {
    // this.channelService.getTrendingChannelsWithSkipOption(this.skip_option).subscribe(
    this.channelService.getPopularChannelsWithSkipOption(this.skip_option[0], 12).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
        if (this.initial_value[0] == false) {
          data.length >= 8 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
          this.initial_value[0] = true;
        }
        this.popular_channels = this.popular_channels.concat(data);
        this.skip_option[0] += 8;
      }, error => {
        console.log(error);
    });
	}

	show_more_trending_channel() {
    this.channelService.getTrendingChannelsWithSkipOption(this.skip_option[1], 12).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[1] = true : this.show_arrow[1] = false ;
        if (this.initial_value[1] == false) {
          data.length >= 8 ? this.show_arrow[1] = true : this.show_arrow[1] = false ;
          this.initial_value[1] = true;
        }
        this.trending_channels = this.trending_channels.concat(data);
        this.skip_option[1] += 8;
      }, error => {
        console.log(error);
    });
	}

	show_more_recent_channel() {
    this.channelService.getRecentChannelsWithSkipOption(this.skip_option[2], 12).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[2] = true : this.show_arrow[2] = false ;
        if (this.initial_value[2] == false) {
          data.length >= 8 ? this.show_arrow[2] = true : this.show_arrow[2] = false ;
          this.initial_value[2] = true;
        }
        this.recent_channels = this.recent_channels.concat(data);
        this.skip_option[2] += 8;
      }, error => {
        console.log(error);
    });
  }
}
