import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { ToastyService, AuthService } from '../../../../services';
import { TranslateService } from '@ngx-translate/core';
import { RefundListingComponent } from '../refund/refund-listing.component';
import { AddressComponent } from '../address/address.component';
import { InfomationService } from '../../../../services/information.service';
import { AccountService } from '../../../../services/account.service';
import { ProfileDetailComponent } from '../profile_detail/profile_detail.component';
import { TabsService } from '../../../../services/tabs.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'list-bank',
  templateUrl: './list-bank.html',
})
export class ListBankComponent implements OnInit {
  updateBankForm: FormGroup;
  userInfo;
  banks = [];
  content = '';
  constructor(
    public nav: NavController,
    private translate: TranslateService,
    public viewCtrl: ViewController,
    public account: AccountService,
    private authService: AuthService,
    private toasty: ToastyService,
    public infoService: InfomationService,
    public navParam: NavParams,
    private tabsService: TabsService
  ) {
    this.updateBankForm = new FormGroup({
      BankId: new FormControl(0, [Validators.required]),
      BankBranchName: new FormControl('', [Validators.required]),
      BankNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]*'),
      ]),
      BankHolderName: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z ]*'),
      ]),
    });
  }

  async ngOnInit() {
    await this.loadBanks();
    await this.load_data();
  }

  async load_data() {
    await this.authService.me_social().then((resp) => {
      this.userInfo = resp.data;
    });
    if (this.userInfo.socialInfo) {
      this.updateBankForm
        .get('BankId')
        .setValue(this.userInfo.socialInfo.BankId);
      this.updateBankForm
        .get('BankBranchName')
        .setValue(this.userInfo.socialInfo.BankBranch);
      this.updateBankForm
        .get('BankNumber')
        .setValue(this.userInfo.socialInfo.BankNumber);
      this.updateBankForm
        .get('BankHolderName')
        .setValue(this.userInfo.socialInfo.AccountBankHolder);
    }
  }

  goTo(state: string) {
    if (state === 'profile-detail') {
      return this.nav.push(ProfileDetailComponent);
    } else if (state === 'refund') {
      return this.nav.push(RefundListingComponent);
    } else if (state === 'address') {
      return this.nav.push(AddressComponent);
    }
  }

  async loadBanks() {
    this.banks = [];
    const res = await this.infoService.getListBank();
    if (res) {
      this.banks = res;
    }
    const default_bank = { Id: 0, Name: '----Chọn----' };
    this.banks.unshift(default_bank);
  }

  async updateBank() {
    if (this.updateBankForm.invalid) {
      return this.toasty.error(
        this.translate.instant('Form is invalid, please check it again!')
      );
    }
    const bank = this.banks.find(
      (b) => b.Id === this.updateBankForm.get('BankId').value
    );
    await this.account
      .updateBankInfo(
        this.updateBankForm.get('BankId').value,
        bank.Name,
        this.updateBankForm.get('BankBranchName').value,
        this.updateBankForm.get('BankHolderName').value,
        this.updateBankForm.get('BankNumber').value
      )
      .then(async (res) => {
        if (res.code === 200) {
          await this.toasty.success('Cập nhật thông tin tài khoản thành công!');
        } else {
          await this.toasty.error(
            'Cập nhật thông tin tài khoản không thành công!'
          );
        }
        // return this.goTo('profile-detail');
      })
      .catch((err) =>
        this.toasty.error(
          this.translate.instant(
            err.error.code === 422
              ? err.error.data.details[0].message
              : err.error.message
          )
        )
      );
  }

  ionViewWillEnter() {
    setTimeout(() => {
      this.tabsService.hide();
    }, 0);
  }
}
