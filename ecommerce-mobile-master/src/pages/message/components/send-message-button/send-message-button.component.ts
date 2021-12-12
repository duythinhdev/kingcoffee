import { Component, Input } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';
import { MessageService, AuthService, ToastyService } from '../../../../services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'send-message-btn',
  template: `<span (click)="sendMessage()"><ion-icon name="chatbubbles"></ion-icon></span>`
})
export class SendMessageButtonComponent {
  @Input() recipientId: string;
  constructor(private translate: TranslateService,
    private authService: AuthService, private modalCtrl: ModalController,
    private messageService: MessageService, private toasty: ToastyService) {
  }

  sendMessage() {
    if (!this.authService.isLoggedin()) {
      return this.toasty.error(this.translate.instant('Please login to send message'))
    }

    this.messageService.createConversation(this.recipientId)
      .then((resp) => {
        const modalRef = this.modalCtrl.create(
          MessageMessageModalComponent, {
            conversation: resp.data
          });
        modalRef.onDidDismiss(data => {
          if (data.id) {
            this.toasty.success(this.translate.instant('Your message has been sent.'))
          }
        });
        modalRef.present();
      });

  }
}

@Component({
  templateUrl: './send-message-modal.html'
})
export class MessageMessageModalComponent {
  private conversationId;
  public message = {
    text: ''
  };
  public submitted: boolean = false;

  constructor(private service: MessageService, public viewCtrl: ViewController) {
    this.conversationId = this.viewCtrl.data.conversation._id;
  }

  submit(frm) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.service.send({
      conversationId: this.conversationId,
      type: 'text',
      text: this.message.text
    })
      .then((resp) => this.viewCtrl.dismiss(resp.data));
  }
}