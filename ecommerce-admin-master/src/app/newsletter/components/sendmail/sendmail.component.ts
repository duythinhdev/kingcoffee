import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NewsletterService } from '../../services/newsletter.service';
import{ SendMailTitleModel,SendMailTitle } from '../../../model/newletter.sendmail.title.model';
import { TranslateService } from '@ngx-translate/core';
import * as ClassicEditor from '../../../../assets/ckeditor/ckeditor';
import { MediaService } from '../../../media/service';

@Component({
  templateUrl: 'sendmail.html'
})
export class SendmailComponent implements OnInit {
  public data = {
    subject: '',
    content: '',
    userType: ''
  };
  public submitted: boolean = false;
  public Editor = ClassicEditor;
  public ckEditorConfig : any;

  sendMailTitleModel: SendMailTitleModel;
  constructor(private service: NewsletterService, private translate: TranslateService,
    private toasty: ToastrService, private mediaService: MediaService) {
      this.ckEditorConfig = this.mediaService.config;
  }

 

  ngOnInit() {
      this.sendMailTitleModel = SendMailTitle[0];
   }

  submit(frm: any) {
    this.submitted = true;
    if (frm.invalid || !this.data.subject || !this.data.content) {
      return this.toasty.error(this.translate.instant('Please enter all content data'));
    }

    this.service.sendMail(this.data)
      .then(() => {
        this.data = {
          subject: '',
          content: '',
          userType: ''
        };
        this.toasty.success(this.translate.instant('Mail has been sent!'));
        this.submitted = false;
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
}
