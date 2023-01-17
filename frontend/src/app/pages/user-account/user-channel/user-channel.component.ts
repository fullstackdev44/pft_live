import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { ChannelService } from '../../shared/services/channel.service';
import { UserService } from '../../shared/services/user.service';

import { Channel } from '../../shared/models/channel';

@Component({
  selector: 'pft-user-channel',
  templateUrl: './user-channel.component.html'
})
export class UserChannelComponent extends CommonComponent implements OnInit {

	public new_channel: Channel = new Channel();
	public user_channels: Channel[] = [];
	public subscribed_channels: Channel[] = [];

  constructor(private channelService: ChannelService, private userService: UserService) {
  	super()
  }

  ngOnInit() {

  	this.initData(this.user_channels, this.userService.getChannelByOwner(), () => {
      if (this.user_channels && this.user_channels[0]) {
        this.channelService.videoCount(this.user_channels[0]._id).subscribe(
          data => {
            // this always return the exact video number
            this.user_channels[0].meta.videos = data.count;
            this.user_channels[0].meta.views = data.views;
            if (this.user_channels[0].meta.videos != data.count || this.user_channels[0].meta.views != data.views ) this.initData(null, this.channelService.updateVideoCount(this.user_channels[0]));
          }, error => {
            console.log(error);
          }
        );
      }
    });
  	this.initData(this.subscribed_channels, this.userService.getSubscriptions());
  }
}
