import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const CSV_EXTENSION = '.csv';
@Injectable()
export class ProductService {
  private allowFields = [
    'name', 'alias', 'description', 'shortDescription', 'categoryId', 'brandId', 'specifications',
    'chemicalIdentifiers', 'safetyHandling', 'featured', 'isActive', 'metaSeo', 'ordering', 'shopId',
    'images', 'mainImage', 'price', 'salePrice', 'stockQuantity', 'sku', 'upc', 'mpn', 'ean', 'digitalFileId',
    'jan', 'isbn', 'taxClass', 'taxPercentage', 'restrictCODAreas', 'restrictFreeShipAreas', 'dailyDeal', 'dealTo', 'hot',
    'bestSell', 'weight', 'isTradeDiscount', 'freeShip', 'fiveElement', 'status', 'note', 'sap', 'expiryDate', 'packingSpecifications',
    'producer', 'country', 'unitPrice', 'unitSalePrice', 'lang','isPromotion'
  ];

  public allCountry = [];

  constructor(private restangular: Restangular, private httpClient: HttpClient) { }

  create(data: any): Promise<any> {
    return this.restangular.all('products').post(_.pick(data, this.allowFields)).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('products', 'search').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('products', id).get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('products', id).customPUT(_.pick(data, this.allowFields)).toPromise();
  }

  remove(id): Promise<any> {
    return this.restangular.one('products', id).customDELETE().toPromise();
  }

  findSeller(params: any): Promise<any> {
    return this.restangular.one('shops', 'search').get(params).toPromise();
  }

  findMyShop(): Promise<any> {
    return this.restangular.one('shops', 'me').get().toPromise();
  }

  findFiveElement(): Promise<any> {
    return this.restangular.one('fiveElementActive').get().toPromise();
  }

  getEventProducts(): Promise<any> {
    return this.restangular.one('products', 'events').get().toPromise();
  }

  getAllCountry(): Promise<any> {
    return this.restangular.one('products', 'country').get().toPromise();
  }
  import(data): Promise<any> {
    return this.restangular.one('products/import','csv').customPOST(data).toPromise();
  }
  export(): Promise<any> {
    return this.restangular.one('products/export','csv').withHttpConfig({
      responseType: 'blob'}).get().subscribe(blob=>{
        const data: Blob = new Blob(["\uFEFF", blob], { type: "text/csv;charset=utf-8" });
        FileSaver.saveAs(data, 'export-' + new Date().getTime() + CSV_EXTENSION)});
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };  
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true},);
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  exportAsExcelFile_ManySheet(arrData: any[], arrSheetName: any[], excelFileName: string): void {
    let excelBuffer;
    let strJsonData = "{";
    let index = 0;
    for(const sheetName of arrSheetName){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(arrData[index]);
      strJsonData += `"${sheetName}":${JSON.stringify(worksheet)}`;
      strJsonData += index < arrSheetName.length -1 ? "," : "";
      ++index;
    }
    strJsonData += "}";
    
    const workbook: XLSX.WorkBook = { Sheets: JSON.parse(strJsonData), SheetNames: arrSheetName };  
    excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true},);    
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + CSV_EXTENSION);
  }
}
