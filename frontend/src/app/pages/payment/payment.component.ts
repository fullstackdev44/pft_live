import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TokenService } from '../shared/authentication/token.service';
import { PaymentService } from '../shared/services/payment.service';
import { UserService } from '../shared/services/user.service';

import { CommonComponent } from '../shared/mock/component';

import { User } from '../shared/models/user';
import { Notify } from '../shared/models/notify';
import { VideoService } from '../shared/services/video.service';
import { NotifyService } from '../shared/services/notify.service';
import { Video } from '../shared/models/video';

declare var $: any;
declare var Stripe: any;

@Component({
  selector: 'pft-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

export class PaymentComponent extends CommonComponent implements OnInit {

  paymentForm: FormGroup;
  loading = false;
  submitted = false;

  amount: number = 25;
  email: string = "";
  before_payment: boolean = true;
  user: User = new User();
  source_id: string;
  payment_info: any;
  payment_processing: boolean = false;
  video: Video = undefined;
  redirection_page: string;
  billing: any = {name: "", telephone: "", email:""};

  payment_error_message: string = "";
  payment_has_been_posted: boolean = false;
  payment_success_message:string =  "";

  channel_id:string = "";

  public donation_message: string = '';
  public show_message: boolean = false;
  public video_priced: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    private paymentService: PaymentService,
    private renderer: Renderer2,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private videoService: VideoService,
    private notificationService: NotifyService
  ) {
    super();
  }

  ngOnInit() {
    const connected_user = this.tokenService.decodeUserToken();

    if (!connected_user) {
      this.router.navigate(['/login/payment']);
    }

    this.initData(this.user, this.userService.getUserDetail(connected_user._id));
    //this.initiatePayment(connected_user._id, 2500);
    this.showPaymentdModal();

    this.route.params.subscribe(
      params => {
        if(params.donation){
          this.show_message = true;
        }

        if(params.video_source_id){
          this.redirection_page = '/video/' + params.video_source_id;
          this.source_id = params.video_source_id;
          this.videoService.getVideoBySourceId(params.video_source_id).subscribe(
            data => {
              this.video = data;
              if(this.show_message == false && params.video_source_id && this.video.price && this.video.price > 0) {
                this.amount = this.video.price;
                this.video_priced = true;
              }
            }, error => {
              console.log(error);
            }
          );
        }

        if(params.channel_id){
          this.channel_id = params.channel_id;
          this.redirection_page = '/channels/' + params.channel_id;
          this.show_message = true;
        }

        // payment for live code
        if(params.live_id){
          this.redirection_page = '/live/' + params.live_id;

          this.videoService.getLive(params.live_id).subscribe(
            data => {
              let live: any = data; // this cast is really needed here (I don't want to change it (may cause conflict with Andry code's))
              this.video = live;
              if(this.show_message == false && params.live_id && this.video.price && this.video.price > 0) {
                this.amount = this.video.price;
                this.video_priced = true;
              }
            }, error => {
              console.log(error);
            }
          );
        }

        // payment for live donation
        if(params.live_video_id && (params.live_donation && params.live_donation == "live_donation") && (params.is_live_param && params.is_live_param == "yes")){
          this.show_message = true;
          this.redirection_page = '/live/' + params.live_video_id;
            this.videoService.getLive(params.live_video_id).subscribe(
              data => {
                this.video = data[0] ? data[0] : undefined;
              }, error => {
                console.log(error);
              }
            );
        }

      }
    );
  }

  showPaymentdModal() {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $('.login_form').removeClass('show');
    $('.form_popup').addClass('opened');
    $('.payment_modal_form').addClass('show');
  }

  hidePaymentdModal() {
    this.renderer.removeClass(document.body, 'overlay');
    $('.form_popup').removeClass('opened');
    $('.payment_modal_form').removeClass('show');
    $('.login_form').removeClass('show');

    if (this.show_message == true || this.payment_processing == true) {
      this.router.navigate([this.redirection_page]);
    }
    if (this.payment_processing == false || this.show_message == false) {
      window.history.go(-2);
    }
  }

  setAmount(amount: number) {
    this.amount = amount;
  }

  initiatePayment(){

    const amount = Math.floor(this.amount * 100); // stripe amounts are in cents (100 means 1$, 499 means $4.99)
    const sender = this.user._id

    this.before_payment = false;

    let body = {
      amount: amount,
      sender: sender
    }

    if (this.video){
      body['video_id'] = this.video._id;
      body['channel_id'] = this.video.channel_id._id;
    }
    else{
      body['channel_id'] = this.channel_id;
    }

    if(this.show_message == true){
      body['purpose'] = 'DONATION';
      body['donation_message'] = this.donation_message;
    }
    else {
      body['purpose'] = 'PURCHASE';
    }

    // For notification
    body['sender_avatar_color'] = this.user.avatar_color;
    body['sender_avatar_card'] = this.user.avatar_card;
    body['sender_full_name'] = this.user.full_name;

    // Initiate stripe payment
    this.paymentService.initiatePayment(body).subscribe(
      data => {
        this.payment_info = data;
        this.loadSripe(data.public_key, data.client_secret, this);
      }
    )
  }

  // --------------------------------------
  // Loading stripe to accept card payment
  // ---------------------------------------
  loadSripe(stripe_public_key: string, client_secret: string, self: any) {

    const stripe = Stripe(stripe_public_key);

    // Create `card` element that will watch for updates
    // and display error messages
    const elements = stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
      base: {
        /*color: '#32325d',*/
        color: '#C3C3D2',
        /*background: '#363643',
        'border-radius': '30px',*/
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element.
    var card = elements.create('card', {
      style: style
    });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    card.addEventListener('change', event => {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    // Listen for form submission, process the form with Stripe,
    // and get the
    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', function(ev) {
      ev.preventDefault();
      // check if room is full or not
      self.paymentService.checkMaxParticipants(self.user._id, self.video._id).subscribe(
        data => {
          if(data['message'] == 'ok'){
            // TODO: get all of these infos from HTML forms
            stripe.confirmCardPayment(client_secret, {
              payment_method: {
                card: card,
                billing_details: {
                  /*address: {
                    city: "San Francisco",
                    country: "US",
                    line1: "1234 Fake Street",
                    line2: null,
                    postal_code: "94102",
                    state: "CA"
                  },
                  */
                  email: self.billing.email,
                  name: self.billing.name
                  /*phone: self.billing.telephone*/
                }
              },
              receipt_email: self.billing.email
            }).then(function(result) {

              self.payment_has_been_posted = true;

              if (result.error) {
                // Show error to your customer (e.g., insufficient funds)
                // TODO: Handle error
                console.log(result.error.message);
                self.payment_error_message = result.error.message;
              } else {
                // possible status: requires_payment_method, requires_confirmation,
                // requires_action, processing, canceled
                // https://stripe.com/docs/payments/intents#intent-statuses
                /*console.log("----------- PI ----------");
                console.log(result.paymentIntent);
                console.log("----------- PI ----------");
                */
                // The payment has been processed!
                if (result.paymentIntent.status === 'succeeded') {
                  self.updateVideoData();
                  // Show a success message to your customer
                  // TODO: handles success

                  self.payment_processing = true;
                  
                  // Will be used when video purchase is back
                  // must check if it is a donation or purchase payment
                  // updatePurchasedVideo() should be commented for donation payment
                  if (self.show_message == false) { // this mean it's a purchase of a video but not a donation
                    self.updatePurchasedVideo();
                  }
                  self.payment_success_message = "Thank you very much for the $" + self.amount + " donation."
                }
              }
            });
          }
        }, error => {
          return error;
        });
    });
  }
  updateVideoData(){
    this.paymentService.updatePurchaseVid(this.user._id, this.video._id).subscribe(
      data => {
      }, error => {
        console.log(error);
      }
    );
  }

  // Will be used when video purchase is back
  updatePurchasedVideo() {  
    let found: boolean = false;
    // no populated purchased video
    this.user.purchased_videos.map((current: any) => {
      if (current == this.video._id) {
        found = true;
      }
    });
    found == false ? this.user.purchased_videos.unshift(this.video) : '';
    if (found == false) {
      this.userService.updateUser(this.user, ["purchased_videos"]).subscribe(
        data => {
        }, error => {
          console.log(error);
        }
      );
    }
  }

  checkIfDecimal(num: number) {
    return Math.floor(num) == num;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }
}
