import { Pipe, PipeTransform } from '@angular/core';
/*
 * show default photo if it is not provided
 */
@Pipe({ name: 'paymentGatewayName' })
export class PaymentGatewayNamePipe implements PipeTransform {
  private paymentGatewayConfigs;

  constructor() {
    this.paymentGatewayConfigs =
      window.appData.paymentGatewayConfig.paymentMethods;
  }

  transform(value) {
    const paymentGateway = this.paymentGatewayConfigs.find(
      (x) => x.value === value
    );
    return paymentGateway ? paymentGateway.name : value;
  }
}
