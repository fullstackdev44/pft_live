import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { CommonComponent } from '../../shared/mock/component';

import { ChannelService } from '../../shared/services/channel.service';
import { VideoService } from '../../shared/services/video.service';
import { PlaylistService } from '../../shared/services/playlist.service';
import { ProductService } from '../../shared/services/product.service';
import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { User } from '../../shared/models/user';
import { Channel } from '../../shared/models/channel';
import { Video } from '../../shared/models/video';
import { Playlist } from '../../shared/models/playlist';
import { Product } from '../../shared/models/product';
import { Notify } from '../../shared/models/notify';
import { NotifyService } from '../../shared/services/notify.service';

declare var $: any;

@Component({
	selector: 'pft-channel-detail',
	templateUrl: './channel-detail.component.html',
	styleUrls: ['./channel-detail.component.css']
})
export class ChannelDetailComponent extends CommonComponent implements OnInit {

	public channel: Channel = new Channel();
	public user: User = new User();
	public user_subscriptions: any[] = [];
	public user_channel_ids: string[] = [];

	public new_link: any = {name: "", url: ""};
	public new_inquiry: any = {name: "", url: ""};

	// view
	public profile_image_hovered: boolean = false;
	public profile_image_uploading: boolean = false;
	public title_hovered: boolean = false;
	public title_clicked: boolean = false;
	public detail_hovered: boolean = false;
	public detail_clicked: boolean = false;
	public links_hovered: boolean = false;
	public links_clicked: boolean = false;
	public inquiries_hovered: boolean = false;
	public inquiries_clicked: boolean = false;

	private profile_image_default_height = 100;
	public banner_edit: boolean = false;
	private banner_edit_entered: boolean = false;
	private banner_edit_down: boolean = false;
	public start_y: number = 0;
	public channel_profile_image_display_offset: number = 0;
	public channel_profile_image_display_limit: number = 0;

  private viewport_height: number;

	public aria_selected: string = "";

	public showRecentUploads: boolean = true;
	public showPopularVideos: boolean = true;
	public showUploads: boolean = true;
	public showOfflineVideos: boolean = true;

	private page_size: number = 8;

	public recentUploadsPage: number = 0;
	public popularVideosPage: number = 0;
	public uploadsPage: number = 0;
  public uploadsPageSize: number = 12;
	public offlineVideosPage: number = 0;
	public searchPage: number = 0;

	public showSearch: boolean = false;
	public search_term: string = "";
	public search_results: Video[] = [];

	public channelNewProduct: Product = new Product();

	public flag_success_message: string = "";
  public flag_warning_message: string = "";
  public flag_error_message: string = "";
  public flag_add_progress: number = 0;

  public todayDay: number = (new Date()).getDay() - 1;
  public days = [0 , 1, 2, 3, 4, 5, 6];
  public weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  public days_name = [];

	public channel_flags: any = {
    inappropriate: false,
    copyrighted: false,
    comment: "",
    video: null,
    channel: null
  };

  // configuration
  public description_length_limit = 500;

	// for view
	public max_length : number[] = [];

	public video_info = {title: '', description: ''};

	public image_size_error: boolean = false;

	public schedules: any[] = [];

	constructor(private route: ActivatedRoute,
		private channelService: ChannelService,
		private videoService: VideoService,
		private playlistService: PlaylistService,
		private productService: ProductService,
		private userService: UserService,
		private renderer: Renderer2,
		private tokenService: TokenService,
		private notificationService: NotifyService,
		private router: Router,
		private location: Location
	) {
		super();
	}

	ngOnInit() {

		this.user = this.tokenService.decodeUserToken();

		this.route.params.subscribe(
			params => {

				this.aria_selected = this.route.snapshot.queryParams['tab'] || 'home';

				// reinitialize tabs view
				this.router.routeReuseStrategy.shouldReuseRoute = () => false;

				this.initData(this.channel, this.channelService.getById(params["id"]), () => {
					// count channel video, and update channel meta videos
					// (needed as sometimes channel meta videos didn't display correct value (this fixed that))
					// Andry: this is dangerous! Deactived this for now
          // Andry: I fixed the videos counting issue so I will comment this out
					this.channelService.videoCount(params['id']).subscribe(
					 	data => {
     	        this.channel.meta.videos = data.count;
    	         // can be removed when data is clean
							this.channel.meta.views = data.views;
					// 		// Hasina: I think only this line must be commented out! (the data is incorrect without counting it)
		 //          // Andry: Alright! I'll add some parameter to the response to also get total likes (can be removed when data is clean)

							// Hasina: This fix the issue correctly, please let me know if you guys are commenting out this again or remove it
							// (the channel.meta.videos display again incorrect value after you had fix it so I re-activate my code to make it correct it)
							// only user owner had the right to update videos count info
							// this update only meta.views, not all channel data (see the function declaration in service)
							if(this.user && this.user._id && this.user._id == (this.channel.owner._id ? this.channel.owner._id : this.channel.owner)) {
								if (this.channel.meta.videos != data.count || this.channel.meta.views != data.views ) this.initData(null, this.channelService.updateVideoCount(this.channel));
							}
					 	}, error => {
					 		console.log(error);
					});

					if(!this.channel.profile_image_offset){
						this.channel.profile_image_offset = 0;
					}

					if(!this.channel.profile_image_height){
            // this.channel.profile_image_offset = this.profile_image_default_height;
						this.channel.profile_image_offset = 0;
					}

          this.viewport_height = $("#banner").height();
					this.computePositionY();
          // console.log(this.channel_profile_image_display_offset);

					// Init playlist channel (needed if user is connected or not)
					this.channel.playlists = [];

					// For connected users
					if(this.user && this.user._id){

						// this.initData(null, this.channelService.reportView(this.channel._id));
						this.initData(this.user_subscriptions, this.userService.getSubscriptions());

						this.user.playlists = [];
						this.user.subscribed_channels = [];
						this.user.watch_later_videos = [];
	          this.initData(this.user.watch_later_videos, this.userService.getWatchLaterVideos());

						if(this.channel.owner.toString() === this.user._id.toString()){

							this.initData(this.user.playlists, this.playlistService.getMyPlaylistsForChannelView(), () => {
								this.initData(this.channel.playlists, this.playlistService.getChannelPlaylistsWithVideos(params["id"]), () => {
									this.user.playlists = this.user.playlists.filter(current => this.channel.playlists.map(current_playlist => current_playlist._id).indexOf(current._id) == -1)
								});
							})
						}

						let user_channels = []
						this.initData(user_channels, this.userService.getChannelByOwner(), () => {
							this.user_channel_ids = user_channels.map(current => current._id);
						});
					}
					
					this.initData(this.channel.featured_videos, this.videoService.getChannelFeaturedVideos(params["id"]));
					this.initData(this.channel.recent_videos, this.videoService.getChannelRecentVideos(params["id"]), () => {
						if(this.channel.recent_videos.length < this.page_size){
							this.recentUploadsPage = -1;
						}
					});
					this.initData(this.channel.popular_videos, this.videoService.getChannelPopularVideos(params["id"]), () => {
						if(this.channel.popular_videos.length < this.page_size){
							this.popularVideosPage = -1;
						}
					});
          this.uploadsPage = 0;
					this.initData(this.channel.videos, this.videoService.getChannelVideos(params["id"], this.uploadsPage, this.uploadsPageSize), () => {
						if(this.channel.videos.length < this.uploadsPageSize){
							this.uploadsPage = -1;
						}
					});

					this.initData(this.channel.playlists, this.playlistService.getChannelPlaylistsWithVideos(params["id"]));
					this.channel.featured_channels = [];
					this.initData(this.channel.featured_channels, this.channelService.getChannelFeaturedChannels(params["id"]), () => {
            this.initData(this.user.subscribed_channels, this.channelService.getSubscribedChannels(), () => {
              this.user.subscribed_channels = this.user.subscribed_channels.filter(current => this.channel.featured_channels.map(current_channel => current_channel._id).indexOf(current._id) == -1)
            })
          });
					this.initData(this.channel.featured_products, this.productService.getChannelProducts(params["id"]));
					this.initData(this.channel.current_live, this.videoService.getChannelCurrentLive(params["id"]));

		  			// Change listed events for future events planned for next 6 days as Eldad request
					var firstday = new Date();
					firstday.setHours(0, 0, 0);
					var lastday = new Date();
					lastday.setDate(lastday.getDate() + 6);
					lastday.setHours(23, 59, 59);

					let future_lives = [];
					this.initData(future_lives, this.videoService.getChannelFutureLivesStart(params["id"], firstday, lastday), () => {

						future_lives.map(current => {

							current.start = new Date(current.live_info.start);
							const live_day = current.start.getDay();

							if(!this.channel.mapped_future_lives[live_day]){
								this.channel.mapped_future_lives[live_day] = []
							}

							this.channel.mapped_future_lives[live_day].push(current);
						})

						// for view
						for (let i = 0; i <= 6 ; i++) {
							if (this.channel.mapped_future_lives && this.channel.mapped_future_lives[i]) {
								if (this.max_length.length < this.channel.mapped_future_lives[i].length) {
									this.max_length = [];
									for (let j = 0; j < this.channel.mapped_future_lives[i].length; j++) {
										this.max_length.push(j);
									}
								}
							}
						}

						// view improvement
						let today_value = new Date().getDay();
						for (let i = 0, day_index = today_value; i <= 6 ; i++, day_index ++) {
							if (day_index <= 6) {
								if (this.channel.mapped_future_lives[day_index]) {
									this.schedules[i] = this.channel.mapped_future_lives[day_index];
								} else {
									this.schedules[i] = null;
								}
							} else {
								if (day_index >= 7) {
									day_index = 0;

									if (this.channel.mapped_future_lives[day_index]) {
										this.schedules[i] = this.channel.mapped_future_lives[day_index];
									} else {
										this.schedules[i] = null;
									}
								}
							}
							!this.days_name[i] ? this.days_name[i] = this.weekDays[day_index] : '';
						}
					})

					this.initData(this.channel.live_videos, this.videoService.getChannelLiveVideos(params["id"]), () => {
						if(this.channel.live_videos.length === 0){
							this.offlineVideosPage = -1;
						}
					});
					this.initData(this.channel.recent_donators, this.userService.getChannelRecentDonators(params["id"]));
				});
			});
	}

	doSearch(page: number = 0, more: boolean = false){

		this.showSearch = true;
		this.videoService.searchInChannel(this.channel._id, this.search_term, page).subscribe(data => {

			if(more){

				this.search_results = this.search_results.concat(data);

				if(data.length < this.page_size){
					this.searchPage = -1;
				}
			}
			else{
				this.search_results = data;
				this.searchPage = 0;
			}
		},
		error => {
			console.log(error)
		})
	}

	showMoreSearch(){
		this.searchPage += 1;
		this.doSearch(this.searchPage, true);
	}

	subscribe(){

		this.initData(null, this.userService.subscribe(this.channel._id), () => {

			this.channel.meta.subscribers += 1;
			this.user_subscriptions.push({_id: this.channel._id});

			// Notification
			this.userService.getChannelByOwner().subscribe(
        data => {
          const notification = new Notify();
          notification.sender = {_id: this.user._id, full_name: this.user.full_name, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color};
          notification.receiver = this.channel.owner;
          notification.type = 'SUBSCRIPTION';
          notification.subscription_channel = this.channel._id;
          notification.sender_channel = data[0] ? data[0]._id : null;

          this.notificationService.createNotification(notification).subscribe(
            data => {

            }, error => {
              console.log(error);
            }
          );
        }, error => {
          console.log(error);
        }
      );

		});
	}

	unsubscribe(){

		this.initData(null, this.userService.unsubscribe(this.channel._id), () => {

			const subscription_index = this.user_subscriptions.map(current => current._id).indexOf(this.channel._id);
			if(subscription_index > -1){

				this.channel.meta.subscribers -= 1;
				this.user_subscriptions.splice(subscription_index, 1);
			}
		});
	}

	userIsSubscribedTo(channel_id: string){
		
		if(!this.user_subscriptions){
			this.user_subscriptions = [];
		}

		return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
	}

	isInWatchLater(video_id: string) {
		if(!this.user || !this.user._id){
			return false;
		}
    return this.user.watch_later_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  addToWatchLater(video: Video) {

    if (!this.user.watch_later_videos){
      this.user.watch_later_videos = [];
    }
    if (this.user.watch_later_videos.map(current => current._id.toString()).indexOf(video._id.toString()) == -1) {

      this.user.watch_later_videos.push(video);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  removeFromWatchLater(video: Video) {
    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(video._id);
    if (video_index > -1) {
      this.user.watch_later_videos.splice(video_index, 1);
      this.userService.updateUser(this.user, ["watch_later_videos"]).subscribe(
        data => {
        }, error => {
          console.log(error);
        }
      );
    }
  }

  isInFeatured(video_id: string) {
  	if(!this.user || !this.user._id){
			return false;
		}
    return this.channel.featured_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  addToFeatured(video: Video){

  	this.initData(null, this.channelService.addFeaturedVideo(this.channel._id, video._id), () => {

  		if(this.channel.featured_videos.length >= 2){
  			this.channel.featured_videos.shift();
  		}
  		this.channel.featured_videos.push(video);
  	})
  }

  removeFromFeatured(video: Video) {

  	this.initData(null, this.channelService.removeFeaturedVideo(this.channel._id, video._id), () => {
  		const video_index = this.channel.featured_videos.map(current => current._id).indexOf(video._id);
  		if(video_index > -1){
  			this.channel.featured_videos.splice(video_index, 1);
  		}
  	})
  }

	userIsOwner(){

		if(!this.user_channel_ids || !this.channel || !this.channel._id){
			return false;
		}

		const channel_index = this.user_channel_ids.indexOf(this.channel._id.toString());
		return channel_index > -1;
	}

	isVideoOfChannel(video: Video) {
		if ( (video.channel_id && video.channel_id._id) && (this.channel && this.channel._id) && video.channel_id._id == this.channel._id) {
			return true;
		} else {
			return false;
		}
	}

	hire(){

	}

	watchlater(live: Video){

	}

	updateProfileFile(event) {

	    const reader: FileReader = new FileReader();

	    reader.onload = () => {

	    	this.profile_image_uploading = true;

      	// get metadata (height)
      	let profile_image = new Image();
      	profile_image.src = reader.result as string;

      	profile_image.onload = () => {

      		this.channel.profile_image_height = profile_image.height;
      		this.channel.profile_image_width = profile_image.width;
      		this.channel.profile_image = profile_image.src as string;
      		this.channel.profile_image_offset = 0;

          this.computePositionY();
          this.computePositionLimitY();

      		this.channelService.updateProfileImage(this.channel).subscribe(
						data => {
							this.profile_image_uploading = false;
							this.image_size_error = false;
	      		}, error => {
							this.image_size_error = true;
						});
      	}
	    }

	    reader.readAsDataURL(event.target.files[0]);
	}

	updateTitle() {

		this.title_clicked = false;
		this.title_clicked = false;

		this.channelService.updateTitle(this.channel).subscribe(
			data => {
				this.channel.avatar_card = data;
			}, error => {
				console.log(error);
			}
		);
	}

	updateDetail() {

		this.detail_clicked = false;
		this.detail_clicked = false;

		this.initData(null, this.channelService.updateDetail(this.channel));
	}

	showMoreRecentUploads() {
		this.recentUploadsPage += 1;
		this.videoService.getChannelRecentVideos(this.channel._id, this.recentUploadsPage).subscribe(data => {
			this.channel.recent_videos = this.channel.recent_videos.concat(data);
			if(data.length < this.page_size || this.recentUploadsPage >= 1){
				this.recentUploadsPage = -1;
			}
		},
		error => {
			console.log(error);
		})
	}

	showMorePopularVideos() {
		this.popularVideosPage += 1;
		this.videoService.getChannelPopularVideos(this.channel._id, this.popularVideosPage).subscribe(data => {
			this.channel.popular_videos = this.channel.popular_videos.concat(data);
			if(data.length < this.page_size || this.popularVideosPage >= 1){
				this.popularVideosPage = -1;
			}
		},
		error => {
			console.log(error);
		})
	}

	showMoreUploads() {

		this.uploadsPage += 1;
		this.videoService.getChannelVideos(this.channel._id, this.uploadsPage, this.uploadsPageSize).subscribe(data => {
			this.channel.videos = this.channel.videos.concat(data);
			if(data.length < this.uploadsPageSize){
				this.uploadsPage = -1;
			}
		},
		error => {
			console.log(error);
		})
	}

	showMoreOfflineVideos() {
		this.offlineVideosPage += 1;
		this.videoService.getChannelLiveVideos(this.channel._id, this.offlineVideosPage).subscribe(data => {
			this.channel.live_videos = this.channel.live_videos.concat(data);
			if(data.length < this.page_size){
				this.offlineVideosPage = -1;
			}
		},
		error => {
			console.log(error);
		})
	}

	clearNewLink(){
		this.new_link = {name: "", link: ""};
	}

	addNewLink() {

		if(!this.channel.links){
			this.channel.links = [];
		}

		this.channel.links.push(JSON.parse(JSON.stringify(this.new_link)));
		this.clearNewLink();
	}

	removeLink(i: number){
		this.channel.links.splice(i, 1);
	}

	updateLinks() {

		this.links_clicked = false;
		this.links_clicked = false;

		if(this.new_link.name && this.new_link.name != ""){
			this.addNewLink();
		}

		this.initData(null, this.channelService.updateLinks(this.channel));
	}

	clearNewInquiry(){
		this.new_inquiry = {name: "", url: ""};
	}

	addNewInquiry() {

		if(!this.channel.business_inquiries){
			this.channel.business_inquiries = [];
		}

		this.channel.business_inquiries.push(JSON.parse(JSON.stringify(this.new_inquiry)));
		this.clearNewInquiry();
	}

	removeInquiry(i: number){
		this.channel.business_inquiries.splice(i, 1);
	}

	updateInquiries() {

		this.inquiries_clicked = false;
		this.inquiries_clicked = false;

		if(this.new_inquiry.name && this.new_inquiry.name != ""){
			this.addNewInquiry();
		}

		this.initData(null, this.channelService.updateInquiries(this.channel));
	}

	isInPurchasedVideo(video_id: string) {
		if(!this.user || !this.user._id){
			return false;
		}
		return this.user.purchased_videos ? this.user.purchased_videos.map(current => current._id).indexOf(video_id) > -1 : false;
	}

	addPlaylistToChannel(playlist: Playlist){
		this.initData(null, this.playlistService.addToChannel(playlist._id, this.channel._id), () => {

			this.channel.playlists.unshift(playlist);
			this.user.playlists = this.user.playlists.filter(current => this.channel.playlists.map(current_playlist => current_playlist._id).indexOf(current._id) == -1);
		})
	}

	featureChannel(channel: Channel){
		this.initData(null, this.channelService.addFeaturedChannel(this.channel._id, channel._id), () => {

			this.channel.featured_channels.push(channel);
			this.user.subscribed_channels = this.user.subscribed_channels
        .filter(current => this.channel.featured_channels.map(current_channel => current_channel._id).indexOf(current._id) == -1);
		})
	}

  removeFromFeaturedChannel(channel: Channel, index) {
    this.initData(null, this.channelService.removeFeaturedChannel(this.channel._id, channel._id), () => {
      
      this.channel.featured_channels.splice(index, 1);
      this.user.subscribed_channels.push(channel);
    })
  }

	addMoreProduct(){
    if(this.channelNewProduct.name && this.channelNewProduct.link && this.channelNewProduct.image){
      this.channel.featured_products.push(this.channelNewProduct);

      this.initData(null, this.channelService.updateFeaturedProducts(this.channel))
      this.channelNewProduct = new Product();
    }
  }

  updateProducts(){
  	this.initData(null, this.channelService.updateFeaturedProducts(this.channel))
  }

  showFlagModal(){

    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#add_flag_modal").addClass("opened");
    $("#add_flag_form").addClass("show");
  }

  hideFlagModal(){

    this.renderer.removeClass(document.body, 'overlay');
    $("#add_flag_modal").removeClass("opened");
    $("#add_flag_form").removeClass("show");
  }

  flagChannel(){

    this.flag_success_message = "";
    this.flag_warning_message = "";
    this.flag_error_message = "";
    this.flag_add_progress = 0;

    $(".lg-in").scrollTop(0);

    // Andry Code
    // I didn't change anything on Andry frontend's

    // After seeing last template of video report of pft-tv
    // I decide to keep both of them
		this.channel_flags.channel = this.channel._id;
    this.initData(null, this.channelService.flag(this.channel._id, this.channel_flags), () => {

      /*this.channel_flags = {
        inappropriate: false,
        copyrighted: false,
        comment: ""
      }*/

      this.flag_add_progress = 50;

      // Hasina Code
      if(!this.user.report_history){
      	this.user.report_history = [];
      }
      this.user.report_history.push(this.channel_flags);
      this.userService.updateUser(this.user, ["report_history"]).subscribe(
        data => {

          this.flag_add_progress = 100;
          this.flag_success_message = "Your reporting has been posted";

          this.channel_flags = {
            inappropriate: false,
            copyrighted: false,
            comment: "",
            video: null,
            channel: null
          };

          setTimeout(() => this.flag_add_progress = 0, 1000);
          // this.hideFlagModal();
        }, error => {
          console.log(error);
        }
      );
    })
	}

	removeFromFeaturedPlaylist(playlist: Playlist, index: number) {
    this.initData(null, this.playlistService.removeFeaturedPlaylist(playlist._id), () => {

      this.channel.playlists.splice(index, 1);
      this.user.playlists.push(playlist);
    })
  }

	@HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

  changeUrlParam(paramValue: string){

  	if(paramValue == ''){
  		return this.location.go('/channels/' + this.channel._id);
  	}

  	const url = this.router.createUrlTree([], {relativeTo: this.route, queryParams: {tab: paramValue}}).toString()
 		this.location.go(url);
  }

  checkDescriptionLimitation(){
  	if(this.channel.detail.length > this.description_length_limit){
  		this.channel.detail = this.channel.detail.substring(0, this.description_length_limit);
  	}
  }

  bannerEditEntered(event){
  	this.banner_edit_entered = true;
  }

	bannerEditLeaved(){

		this.banner_edit_entered = false;
		this.banner_edit_down = false;

		if(this.channel.profile_image_offset > 0){
			this.channel.profile_image_offset = 0;
		}

    if(this.channel.profile_image_height <= this.viewport_height){
      this.channel.profile_image_offset = 0;
    }
    else if(this.channel.profile_image_offset <= -(this.channel.profile_image_height - this.viewport_height)){
			this.channel.profile_image_offset = -(this.channel.profile_image_height - this.viewport_height);
		}

		this.computePositionY();
	}

	bannerEditDown(event){
		this.banner_edit_down = true;
		this.start_y = event.clientY;
	}

	bannerEditUp(){
		this.bannerEditLeaved();
	}

	bannerEditMove(event){

		if(this.banner_edit_down){

			const newPos = event.clientY - this.start_y;

      // console.log(this.channel_profile_image_display_offset + " >= -" + this.channel_profile_image_display_limit);

      // if (this.channel.profile_image_offset <= 0 && (this.channel_profile_image_display_offset >= -this.channel_profile_image_display_limit)) {
      // if (this.channel.profile_image_offset <= 0 && (this.channel_profile_image_display_offset >= -this.channel_profile_image_display_limit)) {
				this.channel.profile_image_offset += newPos;
			// }
      this.computePositionY();

      // console.log(this.channel.profile_image_offset);

			this.start_y = event.clientY;
		}
	}

  updateBannerPosition(){
  	this.channelService.updateProfileImagePosition(this.channel).subscribe(
			data => {
				this.banner_edit = false;
				this.image_size_error = false;
  		}, error => {
				this.image_size_error = true;
			});
  }

  computePositionY(){

    const viewport_width = $("body").width();
  	let viewport_height = $("#edit_banner_container").height() | $("#banner_container").height();

    const default_offset = this.channel.profile_image_offset * (viewport_width / this.channel.profile_image_width);
    const minimum_offset = this.channel.profile_image_height > viewport_height ? -(this.channel.profile_image_height - viewport_height) : 0;

    // console.log("im height : " + this.channel.profile_image_height + " > " + viewport_height);
    // console.log("min : " + minimum_offset + " > " + default_offset);

    this.channel_profile_image_display_offset = default_offset < minimum_offset ? minimum_offset : default_offset;
    // this.channel_profile_image_display_offset = this.channel.profile_image_offset * (viewport_width / this.channel.profile_image_width);
  }

  computePositionLimitY(){

    const viewport_width = $("body").width();
    this.channel_profile_image_display_limit = (this.channel.profile_image_height * (viewport_width / this.channel.profile_image_width)) - this.viewport_height;
  }

  editBanner(){

    this.banner_edit = true;
    this.computePositionLimitY();
  }

  onResized(){

    this.viewport_height = $("#banner").height();
    this.computePositionY();
    this.computePositionLimitY();
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

}
