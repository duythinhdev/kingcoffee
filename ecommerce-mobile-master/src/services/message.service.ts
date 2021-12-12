import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class MessageService {
  private conversationLoaded = new Subject();
  conversationLoaded$ = this.conversationLoaded.asObservable();

  // private channels[];
  private _messages = new Subject();
  messages = this._messages.asObservable();
  constructor(private restangular: Restangular) {}

  listByConversation(conversationId: string, params) {
    return this.restangular
      .one('messages/conversations', conversationId)
      .get(params)
      .toPromise();
  }

  send(data) {
    return this.restangular.one('messages').customPOST(data).toPromise();
  }

  listConversation(params) {
    return this.restangular
      .one('messages/conversations')
      .get(params)
      .toPromise();
  }

  createConversation(recipientId: string) {
    return this.restangular
      .one('messages/conversations')
      .customPOST({ recipientId })
      .toPromise();
  }

  setActiveConversation(conversation) {
    this.conversationLoaded.next(conversation);
  }
}
