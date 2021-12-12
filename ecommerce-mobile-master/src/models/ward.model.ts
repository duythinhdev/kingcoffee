import { GeneralModel } from './general.model';
import { District } from './district.model';

export class Ward extends GeneralModel {
  district_Id: string;
  prefix: string;
  province_Id: string;
}
