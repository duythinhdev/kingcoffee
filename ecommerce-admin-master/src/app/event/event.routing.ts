import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyTicketListingComponent } from './buy-ticket-listing/listing.component';
import { EventSlotComponent } from './event-slot/event-slot.component';
import { AwardListingComponent } from './award-listing/listing.component';
import { ImportBuyTicketListingComponent } from './import-buy-ticket-listing/import.component';

const routes: Routes = [
  {
    path: 'list',
    component: BuyTicketListingComponent,
    data: {
      title: 'Danh sách mua vé',
      urls: [{ title: 'Ngũ hành tương sinh', url: '/event' }, { title: 'Quản lý mua vé' }]
    }
  },
  {
    path: 'import-list',
    component: ImportBuyTicketListingComponent,
    data: {
      title: 'Import danh sách mua vé',
      urls: [{ title: 'Ngũ hành tương sinh', url: '/event' }, { title: 'Import danh sách mua vé' }]
    }
  },
  {
    path: 'event-slot',
    component: EventSlotComponent,
    data: {
      title: 'Quay thưởng',
      urls: [{ title: 'Ngũ hành tương sinh', url: '/event' }, { title: 'Quay thưởng' }]
    }
  },
  {
    path: 'award-list',
    component: AwardListingComponent,
    data: {
      title: 'Danh sách trúng giải',
      urls: [{ title: 'Ngũ hành tương sinh', url: '/event' }, { title: 'Quản lý trúng giải' }]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule {
}
