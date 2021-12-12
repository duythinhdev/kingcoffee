import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { SortablejsModule } from 'ngx-sortablejs';
import { OrderRoutingModule } from './order.routing';

import { ViewComponent } from './components/view/view.component';
import { ListingComponent, OrderModal } from './components/listing/listing.component';

import { OrderService } from './services/order.service';

import { NoImagePipe, NoPhotoPipe } from '../shared/pipes';
import { UtilsModule } from '../utils/utils.module';
import { NgbDateCustomParserFormatter } from './services/formatdate.service';
//  MatCardModule,MatPaginatorModule,MatDatepickerModule,MatNativeDateModule,MatInputModule} from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BravoService } from './services/bravo.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //SortablejsModule,
    //our custom module
    OrderRoutingModule,
    NgbModule,
    UtilsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  declarations: [
    ViewComponent,
    ListingComponent,
    NoImagePipe,
    NoPhotoPipe,
    OrderModal
  ],
  providers: [
    OrderService,
    BravoService,
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter}
  ],
  exports: [],
  entryComponents:[
    OrderModal
  ]
})
export class OrderModule { }
