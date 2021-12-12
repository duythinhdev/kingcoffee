import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserRoutingModule } from './user.routing';
import { UserCreateComponent } from './create/create.component';
import { UserListingComponent } from './list/listing.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { UserService } from './user.service';
import { UserUpdateComponent } from './update/update.component';
import { ProfileUpdateComponent } from './profile/profile-update.component';
import { MediaModule } from '../media/media.module';
import { LogoutComponent } from './profile/logout.component';
import { UserHistoryComponent } from './history/userhistory.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //our custom module
    UserRoutingModule,
    NgbModule,
    MediaModule
  ],
  declarations: [
    UserCreateComponent,
    UserListingComponent,
    UserUpdateComponent,
    ProfileCardComponent,
    ProfileUpdateComponent,
    LogoutComponent,
    UserHistoryComponent
  ],
  providers: [UserService],
  exports: [
    ProfileCardComponent
  ]
})
export class UserModule { }
