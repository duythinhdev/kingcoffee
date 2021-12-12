import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../services';
@Component({
  selector: 'dial-code',
  templateUrl: './dial.html',
})
export class DialCodeComponent {
  @Output() selectCode = new EventEmitter();
  dialCodes = [];
  dialCode = '+84';
  selectOptions = {
    title: 'Chọn mã vùng',
    mode: 'md',
  };

  constructor(private authService: AuthService) {
    this.dialCodes = this.authService.getDialCodes();
  }

  selectDial() {
    this.selectCode.emit(this.dialCode);
  }
}
