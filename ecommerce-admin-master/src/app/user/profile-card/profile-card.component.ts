import { Component, OnInit, Input } from '@angular/core';
import { UserProfileCardTitle, UserProfileCardTitleModel } from '../../model/user.profilecard.title.model';

@Component({
  selector: 'profile-card',
  templateUrl: './profile-card.html'
})
export class ProfileCardComponent implements OnInit {
  @Input() user: any;
  userProfileCardTitleModel: UserProfileCardTitleModel;
  // TODO - add option to query user from server by user id
  constructor(){ }

  ngOnInit() {
    this.userProfileCardTitleModel = UserProfileCardTitle[0];
    // TODO - add event emitter listen the change
  }
}
