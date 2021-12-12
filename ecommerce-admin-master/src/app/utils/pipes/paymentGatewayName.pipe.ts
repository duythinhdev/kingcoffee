import { Pipe, PipeTransform } from '@angular/core';
import { SystemService } from '../../shared/services';

/*
 * show default photo if it is not provided
*/
@Pipe({name: 'paymentGatewayName'})
export class PaymentGatewayNamePipe implements PipeTransform {
  private paymentGatewayConfigs: any;

  constructor(private sysService: SystemService){
    const configs = this.sysService.getConfig();
    this.paymentGatewayConfigs = configs.paymentGatewayConfig.paymentMethods;
  }
  
  transform(value) : any {
    const paymentGateway = this.paymentGatewayConfigs.find(x => x.value === value);
    return paymentGateway ? paymentGateway.name : value;
  }
}
