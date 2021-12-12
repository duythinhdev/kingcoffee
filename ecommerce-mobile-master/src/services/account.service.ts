import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MsgService } from './msg-message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../app/environments/environment';
import { Subject } from 'rxjs/Subject';
import { App } from 'ionic-angular';
import { LoginComponent } from '../pages/auth';

@Injectable()
export class AccountService extends GeneralService {
  isLoggedIn = new Subject();
  isLoggedIn$ = this.isLoggedIn.asObservable();
  constructor(
    protected http: HttpClient,
    protected alertService: MsgService,
    public app: App
  ) {
    super(http, alertService, environment.investUrl, 'Account');
  }

  async updateFireBaseToken(token) {
    const model = {
      InstanceIDToken: token,
    };
    const res = await this.post('updateFireBaseToken', model);
    if (!this.isValidResponse(res)) {
      return;
    }

    return res.data;
  }

  async forgot(phone: string) {
    const model = {
      phone,
    };
    const process = await this.post('SendOTPForgetPass', model);
    return process;
  }

  async confirmOTPCode(otpCode: string, phone: string) {
    const model = {
      OTP: otpCode,
      Mobile: phone,
    };
    const process = await this.post('ConfirmOTPForgetPass', model);
    return process;
  }

  async confirmOTPRegister(otpCode: string, phone: string) {
    const model = {
      OTP: otpCode,
      Mobile: phone,
    };
    const process = await this.post('ConfirmOTP', model);
    return process;
  }

  async changePassword(OTP, Mobile, Password, ConfirmPassword) {
    // các field có thể có có thể không
    const model = {
      OTP,
      Mobile,
      Password,
      ConfirmPassword,
    };
    const process = await this.post('ChangePassword', model);
    if (process) {
      return process;
    } else {
      return undefined;
    }
  }

  async getTermAndCondition() {
    const process = (await this.post('GetTermAndCondition', undefined))
    if (process) {
      return process.Data.Content;
    }
    return undefined;
  }
  async ChangeRoleToWe(token) {
    try {
      const model = {
        token,
      };
      const process = await this.post('ChangeRoleToWe', model);
      return process;
    } catch (error) {
      console.log(error)
    }
   
  }

  async getOTP(phone: string) {
    const model = {
      phone,
    };
    const process = await this.post('SendOTPRegister', model);
    return process;
  }

  async getQuestionAgent() {
    const process = (await this.post('GetQuestionAgent', undefined));
    if (process) {
      return process.Data;
    }
    return process;
  }

  async confirmQuestionAgent(phone: string, answer: any = []) {
    const model = {
      Mobile: phone,
      QuestionAnswer: answer,
    };
    const process = await this.post('ConfirmQuestionAgent', model);
    return process;
  }

  async registerTNI(model) {
    const process = await this.post('RegisterTNI', model);
    return process;
  }

  async checkDuplicateRegister(
    taxCode,
    cmnd,
    mobile,
    email = '',
    bankNumber = ''
  ) {
    // các field có thể có có thể không
    const model = {
      TaxCode: taxCode,
      CMND: cmnd,
      Mobile: mobile,
      Email: email,
      BankNumber: bankNumber,
    };
    const process = await this.post('CheckDuplicateRegister', model);
    if (process) {
      return process;
    } else {
      return undefined;
    }
  }

  async changeRoleToWeHome() {
    const process = await this.get('ChangeRoleToWeHome');
    if (process) {
      return process;
    } else {
      return undefined;
    }
  }

  async updatePassword(id, oldPassword, newPassword, confirmPassword) {
    const modal = {
      UserId: id,
      _OldPassword: oldPassword,
      New_Pass: newPassword,
      CNew_Pass: confirmPassword,
    };
    const process = await this.post('UpdatePassword', modal);
    if (!process) {
      return undefined;
    }
    return process;
  }

  async updateBankInfo(
    bankId,
    bankName,
    bankBranchName,
    bankHolderName,
    bankNumber
  ) {
    const modal = {
      bankId,
      bankName,
      bankBranchName,
      bankHolderName,
      bankNumber,
    };
    const process = await this.postBaseApi('UpdateBankInfo', modal);
    if (!process) {
      return undefined;
    }
    return process;
  }

  async logout() {
    const nav = this.app.getActiveNav();
    this.isLoggedIn.next(false);
    // return nav.setRoot(LoginComponent);
    return nav.push(LoginComponent);
  }
  labelAttribute = 'label';
}
