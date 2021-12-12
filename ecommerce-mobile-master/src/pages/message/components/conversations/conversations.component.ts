import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MessageService, PusherService, AuthService } from '../../../../services';
import { MessagesComponent } from '../messages/messages.component';

@Component({
  templateUrl: './conversations.html'
})
export class ConversationsComponent {
  public originalConversations = [];
  public conversations = [];
  private currentUser;
  public activeConversation;
  public q = '';

  constructor(private service: MessageService, private pusher: PusherService, private authService: AuthService, private nav: NavController) {
    this.authService.getCurrentUser().then(resp => this.currentUser = resp);
    this.service.listConversation({ take: 1000 }).then(resp => {
      this.originalConversations = resp.data.items;
      this.conversations = this.mapConversationName(this.originalConversations);
      this.pusher.messages.subscribe(data => this.conversations.forEach((conversation) => {
        if (conversation._id === data.conversationId) {
          conversation.lastMessage = data;
        }
      }));
    });

  }

  mapConversationName(conversations = []) {
    return conversations.map((conversation) => {
      const member = (conversation.members || []).filter(m => m._id !== this.currentUser._id);
      conversation.name = member.length ? member[0].name : 'N/A';
      conversation.member = member.length ? member[0] : null;
      return conversation;
    });
  }

  selectConversation(conversation) {
    this.activeConversation = conversation;
    this.service.setActiveConversation(conversation);
    this.nav.push(MessagesComponent, { activeConversation: conversation });
  }

  filter() {
    this.conversations = this.originalConversations.filter(conversation => conversation.name.toLowerCase().indexOf(this.q.toLowerCase()) > -1);
  }
}
