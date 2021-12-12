import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { SortablejsModule } from 'ngx-sortablejs';
import { EventRoutingModule } from './event.routing';
import { MediaModule } from '../media/media.module';

import { BuyTicketListingComponent } from './buy-ticket-listing/listing.component';
import { EventSlotComponent } from './event-slot/event-slot.component';
import { AwardListingComponent } from './award-listing/listing.component';
import { AwardModalComponent } from './award-modal/award-modal.component';
import { SlotModalComponent } from './event-slot-modal/event-slot-modal.component';

import { EventService } from './services/event.service';
import { UtilsModule } from '../utils/utils.module';
import { ProductService } from '../product/services/product.service';
import { ImportBuyTicketListingComponent } from './import-buy-ticket-listing/import.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //SortablejsModule,
    //our custom module
    EventRoutingModule,
    NgbModule,
    MediaModule,
    UtilsModule
  ],
  declarations: [
    BuyTicketListingComponent,
    EventSlotComponent,
    AwardListingComponent,
    AwardModalComponent,
    SlotModalComponent,
    ImportBuyTicketListingComponent
  ],
  providers: [
    EventService,
    ProductService,
  ],
  exports: [],
  entryComponents: [
    AwardModalComponent,
    SlotModalComponent
  ]
})
export class EventModule { }
