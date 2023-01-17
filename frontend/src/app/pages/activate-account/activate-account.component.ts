import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';

import { UserService } from '../shared/services/user.service';

declare var $: any;

@Component({
  selector: 'pft-activate-account',
  templateUrl: './activate-account.component.html'
})
export class ActivateAccountComponent implements OnInit {

  public sign_up_success: boolean = undefined;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.showActivateAccountModal();
        if(params.token) {
          this.userService.activateAccount(params).subscribe(
            data => {
              this.sign_up_success = true;
            }, error => {
              console.log(error);
              this.sign_up_success = false;
            }
          );
        }
      });
  }

  showActivateAccountModal(){
    // TODO: use service for this
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".form_popup").addClass("opened");
    $(".login_form").addClass("show");
  }

  hideActivateAccountModal(){
    // TODO: use service for this
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".login_form").removeClass("show");
    this.router.navigate(['/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }
}
