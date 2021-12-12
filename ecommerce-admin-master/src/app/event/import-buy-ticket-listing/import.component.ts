import { Component, OnInit, Input } from '@angular/core';
import { EventService } from '../services/event.service';
import { UtilService } from '../../shared/services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

@Component({
  selector: 'import-buy-ticket-listing',
  templateUrl: './import.html'
})
export class ImportBuyTicketListingComponent implements OnInit {

  public issueDocumentOptions: any;
  public issueDocument: any;

  constructor(
    private router: Router,
    private eventService: EventService,
    private toasty: ToastrService,
    private utilService: UtilService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.issueDocumentOptions = {
      url: window.appConfig.apiBaseUrl + '/event/upload',
      fileFieldName: 'file',
      hintText: 'Chọn hoặc kéo thả tài liệu xác nhận ở đây',
      onFinish: (resp) => {
        this.issueDocument = resp.data;
      },
      onCompleteItem: (resp) => {
        if(resp){
          if(resp.code == 400){
            if(resp.message == 'USER_NOT_EXIST_IMPORT_EVENT'){
              resp.data.message.forEach(element => {
                this.toasty.error(this.translate.instant(element));
              });
            } else if(resp.data.message){
              this.toasty.error(this.translate.instant(resp.data.message));
            }
            else{
              this.toasty.error(this.translate.instant('Upload file import is unsuccessfully!'));
            }
            return;
          }
          if(resp.code == 200){
            this.toasty.success(this.translate.instant('Upload file import is successfully!'));
            return;
          }
        }
        this.toasty.error(this.translate.instant('Upload file import is unsuccessfully!'));
      }
    };
  }
}
