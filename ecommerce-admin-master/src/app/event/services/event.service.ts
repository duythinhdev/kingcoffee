import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class EventService {
  private allowFields = [
    'name', 'alias', 'description', 'shortDescription', 'categoryId', 'brandId', 'specifications',
    'chemicalIdentifiers', 'safetyHandling', 'featured', 'isActive', 'metaSeo', 'ordering', 'shopId',
    'images', 'mainImage', 'type', 'price', 'salePrice', 'stockQuantity', 'sku', 'upc', 'mpn', 'ean', 'digitalFileId',
    'jan', 'isbn', 'taxClass', 'taxPercentage', 'restrictCODAreas', 'restrictFreeShipAreas', 'dailyDeal', 'dealTo', 'hot',
    'bestSell', 'weight', 'isTradeDiscount', 'freeShip', 'fiveElement'
  ];

  constructor(private restangular: Restangular) { }

  create(data: any): Promise<any> {
    return this.restangular.all('events').post(_.pick(data, this.allowFields)).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('event', 'search').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('event', id).get().toPromise();
  }

  findWinner(id): Promise<any> {
    return this.restangular.one('event/winners', id).get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('events', id).customPUT(_.pick(data, this.allowFields)).toPromise();
  }

  updateWinner(id, data): Promise<any> {
    return this.restangular.one('event/winners', id).customPUT(_.pick(data, this.allowFields)).toPromise();
  }

  remove(id): Promise<any> {
    return this.restangular.one('event', id).customDELETE().toPromise();
  }

  getAwardCode(params): Promise<any> {
    return this.restangular.one('event', 'randomWinner').get(params).toPromise();
  }

  getTotalInfo(): Promise<any> {
    return this.restangular.one('event', 'getBuyTicketTotalInfo').get().toPromise();
  }

  getAwardList(params: any): Promise<any> {
    return this.restangular.one('event', 'winners').get(params).toPromise();
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  sendEmail(params: any): Promise<any> {
    return this.restangular.one('event', 'resend-mail').get(params).toPromise();
  }
}
