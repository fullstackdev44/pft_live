import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { TokenService } from '../../shared/authentication/token.service';
import { Playlist } from '../../shared/models/playlist';
import { PlaylistService } from '../../shared/services/playlist.service';
import { Channel } from '../../shared/models/channel';
import { ChannelService } from '../../shared/services/channel.service';
import { User } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';

declare var $: any;

@Component({
  selector: 'pft-user-playlist',
  templateUrl: './user-playlist.component.html',
  styleUrls: ['./user-playlist.component.css']
})
export class UserPlaylistComponent extends CommonComponent implements OnInit {

  public index: number;
  public playlists: Playlist[] = [];
  public new_playlist: Playlist = new Playlist();
  public channels: Channel[] = [];

  public create_new_playlist: boolean = undefined;
  public publish_playlist: boolean = true;

  public loading: boolean = false;

  public user: User = new User();
  public submit_form = false;

  constructor(
    private tokenService: TokenService,
    private renderer: Renderer2,
    private playlistService: PlaylistService,
    private channelService: ChannelService,
    private userService: UserService
  ) {
    super();
  }

  ngOnInit() {
    const logged_in_user = this.tokenService.decodeUserToken();

    if (logged_in_user._id) {
      this.initData(this.playlists, this.playlistService.myPlaylistsForUserAccountPlaylistView());

      this.channelService.getMyChannels().subscribe(
        data => {
          this.channels = data;

          if(this.channels && this.channels.length){
            this.new_playlist.channel = this.channels[0]._id;
            if(this.channels[0] && this.channels[0].active == false) this.publish_playlist = false;
          }
        }, error => {
          console.log(error);
        }
      );

      this.initData(this.user, this.userService.getConnected(), () => {
        if(this.user.account_type == 'USER') this.publish_playlist = false;
      });
    }
  }

  removePlaylist() {
    this.loading = true;
    this.playlistService.deletePlaylist(this.playlists[this.index]).subscribe(
      data => {
        this.loading = false;
        this.playlists.splice(this.index, 1);
        this.index = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  showConfirmationModal() {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#playlist_modal").addClass("opened");
    $(".login_form").addClass("show");
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
    this.submit_form = false;
    this.new_playlist = new Playlist();
    if(this.channels && this.channels.length){
      if(this.channels[0] && this.channels[0].active == false) this.publish_playlist = false;
      if(this.channels[0] && this.channels[0].active == true) this.new_playlist.channel = this.channels[0]._id;
    }
  }

  showDeleteModal(index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#delete_modal").addClass("opened");
    $(".login_form").addClass("show");
    this.index = index;
  }

  hideDeleteModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
  }

  savePlaylist() {
    this.submit_form = true;

    if(!this.new_playlist.title){
      return;
    }

    if(!this.publish_playlist){
      this.new_playlist.channel = null;
    }

    if (this.new_playlist.channel && this.new_playlist.channel.title == undefined) {
      const result = this.channels.filter((current) => current._id == this.new_playlist.channel.toString());
      this.new_playlist.channel = result[0];
    }

    this.playlistService.createPlaylist(this.new_playlist).subscribe(
      data => {
        this.submit_form = false;
        this.new_playlist = new Playlist();
        if(this.channels && this.channels.length){
          if(this.channels[0] && this.channels[0].active == false) this.publish_playlist = false;
          if(this.channels[0] && this.channels[0].active == true) this.new_playlist.channel = this.channels[0]._id;
        }
        this.playlists.unshift(data);
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}
