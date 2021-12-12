import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Content, ViewController } from 'ionic-angular';
import { PusherService, AuthService, MessageService } from '../../../../services';
import { isNil } from 'lodash';

@Component({
  selector: 'messages-box',
  templateUrl: './messages.html'
})
export class MessagesComponent implements OnInit {
  @ViewChild('bottom') bottom: Content;
  items = [];
  page = 1;
  pageSize = 10;
  total = 0;
  currentUser = {};
  newText = '';
  conversation;
  private conversationSubscription: Subscription;

  constructor(
    private authService: AuthService, private messageService: MessageService, private pusher: PusherService, private viewCtrl: ViewController) {
    this.conversation = this.viewCtrl.data.activeConversation;
    this.conversationSubscription = messageService.conversationLoaded$.subscribe((data: { _id }) => {
      if (this.conversation && this.conversation._id === data._id) {
        return;
      }

      this.conversation = data;
      this.items = [];
      this.query();
    });
  }

  async ngOnInit() {
    await this.authService.getCurrentUser().then(resp => this.currentUser = resp);
    this.pusher.messages.subscribe(data => {
      if (data.conversationId === this.conversation._id) {
        this.items.push(data);
        return this.bottom.scrollToBottom(500);
      }
    });
    if (this.conversation) {
      this.query();
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.conversationSubscription.unsubscribe();
  }

  query() {
    this.messageService.listByConversation(this.conversation._id, {
      page: this.page,
      take: this.pageSize
    }).then((resp) => {
      this.total = resp.data.count;
      this.items = resp.data.items.reverse().concat(this.items);
      setTimeout(() => {
        return this.bottom.scrollToBottom(500);
      }, 1000);
    });
  }

  send() {
    if (!isNil(this.newText)) {
      return;
    }

    this.messageService.send({
      text: this.newText,
      type: 'text',
      conversationId: this.conversation._id
    }).then((resp) => {
      this.items.push(resp.data);
      this.newText = '';
       return this.bottom.scrollToBottom(500);
    });
  }
}
