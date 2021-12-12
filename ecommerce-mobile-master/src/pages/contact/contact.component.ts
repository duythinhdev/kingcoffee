import { Component } from '@angular/core';
import { ContactService, ToastyService } from '../../services';
import { NavController } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'contact-page',
  templateUrl: './contact.html',
})
export class ContactComponent {
  submitted = false;
  contact = {
    name: '',
    email: '',
    message: '',
  };

  constructor(
    private contactService: ContactService,
    private toasty: ToastyService,
    private nav: NavController,
    private translate: TranslateService
  ) {}

  submit(frm) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.contactService
      .create(this.contact)
      .then(async () => {
        await this.toasty.success(
          this.translate.instant(
            'Your message has been sent. Our admin will contact with you ASAP.'
          )
        );
        return this.nav.setRoot(HomePage);
      })
      .catch(() =>
        this.toasty.error(
          this.translate.instant('Something went wrong, please try again')
        )
      );
  }
}
