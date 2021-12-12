import { SelectModel } from './selectModel.model';

export class ShippingAdressModel {
  address: string;
  city: SelectModel;
  default: boolean = true;
  district: SelectModel;
  firstName: string;
  isProfile: boolean = false;
  lastName: string;
  phoneNumber: string;
  ward: SelectModel;
  zipCode: string;
  _id: string;
}
