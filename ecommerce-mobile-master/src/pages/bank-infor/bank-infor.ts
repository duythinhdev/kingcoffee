import { Component } from '@angular/core';
import { InfomationService } from '../../services/information.service';
/**
 * Generated class for the BankInforComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bank-infor',
  templateUrl: 'bank-infor.html'
})
export class BankInforComponent {

  text: string;
  bankinfo = {
    BankName: "Viettel",
    BankBranchName: "TP.HCM",
    BankNumber: "1234 1234 1234 1234",
    AccountHolder: "Tran van a",
    Description: "Chỉ với 500,000đ bạn đã sở hữu những chính sách\r\n\r\nưu đãi đặc biệt từ KING COFFEE"
  }
  constructor(
    private infoService: InfomationService
  ) {
    this.text = 'Hello World';
  }
  async ngOnInit() {
    await this.getBankInfo();
  }

  async getBankInfo() {
    const res = await this.infoService.getBankInfo();
    if (res) {
      this.bankinfo = res;
    }
  }

}
