import { Component, OnInit } from '@angular/core';
import { AuthService, LocationService, ToastyService } from '../../../services';
import { NavController, NavParams } from 'ionic-angular';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { Console } from '@angular/core/src/console';
import { RegisterComponent } from '../register/register.component';
import { SelectModel } from '../../../models/selectModel.model';
import { Province } from '../../../models/province.model';
import { District } from '../../../models/district.model';
import { Ward } from '../../../models/ward.model';
import { ParseSpan } from '@angular/compiler';
import { AccountComponent } from '../account/account.component';
import { AccountService } from '../../../services/account.service';
import { InfomationService } from '../../../services/information.service';
import { TabsService } from '../../../services/tabs.service';
import * as moment from "moment";
import { JsonpModule } from '@angular/http';
import { Device } from '@ionic-native/device';

@Component({
  selector: 'page-survey',
  templateUrl: 'survey.component.html'
})
export class SurveyComponent implements OnInit {
  // public dialCode = '';
  deviceId;
  input = {
    BusinessForm: [{
      "Name": 1,
      "Value": 1
    },
    {
      "Name": 2,
      "Value": 1
    }],
    CompanyType: '',
    CompanyName: '',
    Name: '',
    Birthday: '',
    CMND: '',
    Job: '',
    Acedimiclevel: 1,
    TaxCode: '',
    ProvinceId: 1,
    DistrictId: 1,
    WardId: 1,
    Address: '',
    Landline: '',
    Sex: 1,
    isMarriage: 1,
    Mobile: '',
    PassWord: '',
    ConfirmPassword: '',
    Email: '',
    BankId: 0,
    BankBranchName: '',
    BankNumber: '',
    BankHoldername: '',
    Sponsor: '',
    KnowFrom: 1,
    ReferralCode: '',
    CustomerNumberSponsor: '',
    DeviceId: ''
  };
  survey = {
    Id: 1,
    Question: '',
    Answer: [Answer]
  }
  bankinfo = {
    BankName: "Viettel",
    BankBranchName: "TP.HCM",
    BankNumber: "1234 1234 1234 1234",
    AccountHolder: "Tran van a",
    Description: "Chỉ với 500,000đ bạn đã sở hữu những chính sách\r\n\r\nưu đãi đặc biệt từ KING COFFEE"
  }
  list_survey;
  list_answer = [];
  answer_item = {
    QuestionId: 0,
    AnswerId: 0
  }
  submitted = false;
  loginPage = LoginComponent;
  isSuccess = false;
  constructor(private account: AccountService, private nav: NavController, private navParams: NavParams,
    private toasty: ToastyService, private translate: TranslateService, private infoService: InfomationService
    , private tabsService: TabsService
    , public locationService: LocationService,
    private device: Device,
    public authService: AuthService) {
    this.input = this.navParams.data;
    this.deviceId = this.device.uuid;
  }
  async ngOnInit() {
    await this.getQuestionAgent();
    await this.getBankInfo();
    this.submitted = false;
  }
  goTo(state) {
    this.submitted = true;
    state === 'login' ? this.nav.setRoot(LoginComponent) : this.nav.setRoot(LoginComponent);
  }
  async getQuestionAgent() {
    this.list_survey = [];
    const res = await this.account.getQuestionAgent();
    if (res) {
      this.list_survey = res;
    }
  }
  select_Anser(questionId, answerId, item) {
    const find = this.list_answer.find(x => x.QuestionId === questionId);
    if (find) {
      find.AnswerId = answerId;
    } else {
      this.list_answer.push({
        QuestionId: questionId,
        AnswerId: answerId
      });
    }
  }
  async confirmSurvey() {
    this.submitted = true;
    if (this.list_survey.length !== this.list_answer.length) {
      this.submitted = false;
      return this.toasty.error(this.translate.instant('Vui lòng trả lời hết tất cả câu hỏi!'));
    } else {
      const res = await this.account.confirmQuestionAgent(this.input.Mobile, this.list_answer);
      if (res.StatusCode === 200) {
        await this.toasty.success(this.translate.instant('Khảo sát thành công!'));
        this.input.Birthday = moment(this.input.Birthday).format("DD-MM-YYYY");
        const step1 = localStorage.getItem('step1');
        let isCompany = JSON.parse(step1).isCompany;
        if (!this.deviceId) {
          this.deviceId = 'd8da544894e56aea';
        }
        this.input.DeviceId = this.deviceId;
        if (isCompany == 2) {
          // this.input.CustomerNumberSponsor=
          let jsonTNI = {
            "BusinessForm": [
              {
                "Name": 1,
                "Value": 1
              },
              {
                "Name": 2,
                "Value": 1
              },
              {
                "Name": 5,
                "Value": 1
              },
            ],
            "CompanyType": 0,
            "CompanyName": "",
            "Name": this.input.Name,
            "Mobile": this.input.Mobile,
            "Email": this.input.Email,
            "PassWord": this.input.PassWord,
            "ConfirmPassword": this.input.PassWord,
            "CustomerNumberSponsor": this.input.CustomerNumberSponsor,
            "DeviceId": this.deviceId
          }
          console.log(jsonTNI)
          let a = await this.account.registerTNI(jsonTNI);
        }
        else {
          let b = await this.account.registerTNI(this.input);
          console.log(this.input)

        }

        await this.getBankInfo();
        this.isSuccess = true;
        localStorage.removeItem("step1");
        localStorage.removeItem("step2");
        localStorage.removeItem("step3");
        this.submitted = false;
      } else {
        this.submitted = false;
        await this.toasty.error('Có lỗi khảo sát, vui lòng liên hệ admin!');
        return this.goTo("login");
      }

    }
  }
  async getBankInfo() {
    const res = await this.infoService.getBankInfo();
    if (res) {
      this.bankinfo = res;
    }
  }

  ionViewWillEnter() {
    setTimeout(() => {
      this.tabsService.hide();
    }, 0);
  }
  ionViewWillLeave() {
    setTimeout(() => {
      this.tabsService.show();
    }, 0);
  }
}
export class Answer {
  Id: number;
  QuestionId: number;
  Answer: string;
  Point = 1;
  LevelNumber = 1
}
