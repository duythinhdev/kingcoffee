import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductListTitleModel, ProductListTitle } from '../../model/product.listing.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'product-listing',
  templateUrl: './listing.html',
  styles: [`
  input[type="file"] {
    display: none;
  }
  .custom-file-upload {
    border-radius: 0.25rem;
    display: inline-block;
    background: #745af2;
    border: 1px solid #745af2;
    box-shadow: 0 2px 2px 0 rgba(116, 96, 238, 0.14), 0 3px 1px -2px rgba(116, 96, 238, 0.2), 0 1px 5px 0 rgba(116, 96, 238, 0.12);
    transition: 0.2s ease-in;
    cursor: pointer;
    padding:7px 12px;
    color:white;
  }
`]
})
export class ProductListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public items = [];
  public page: any = 1;
  public total: any = 0;
  public searchText: any = '';
  public searchSap: any = '';
  public getShopId: any = '';
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public searchStatusList: string[] = ["Tất cả", "Đã duyệt", "Chờ duyệt", "Từ chối"];
  public searchStatus: string = this.searchStatusList[0];
  public searchStatusVal: number = 0;

  public searchActiveList: string[] = ["Tất cả", "Kích hoạt", "Chưa kích hoạt"];
  public searchActive: string = this.searchActiveList[0];
  public searchActiveVal: number = 0;
  productListTitleModel : ProductListTitleModel;
  constructor(private router: Router, private productService: ProductService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.productListTitleModel = ProductListTitle[0];
    this.query();
  }

  query() {
    const params: object = {
      page: this.page,
      q: this.searchText,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`,
    }
    if(this.searchStatusVal !== 0) {
      params["status"] = this.searchStatusVal;
    }
    if(this.searchActiveVal !== 0) {
      params["isActive"] = (this.searchActiveVal === 1) ? true : false;
    }
    if(this.searchSap !== null) {
      params["sap"] = this.searchSap;
    }
    this.productService.search(params)
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
        this.getShopId = resp.data.items[0].shopId;
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  remove(itemId: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.productService.remove(itemId)
        .then(() => {
          this.query();
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  sortStatus(val: number) {
    this.searchStatus = this.searchStatusList[val];
    this.searchStatusVal = val;
    this.page = 1;
    this.query();
  }

  sortActive(val: number) {
    this.searchActive = this.searchActiveList[val];
    this.searchActiveVal = val;
    this.page = 1;
    this.query();
  }

  onSearch() {
    this.page = 1;
    this.query();
  }

  export(){
    this.productService.export()
  }
  import(event){
    if (event.target.files.length == 0) {
      alert("No file selected!");
      return
   }
     let file: File = event.target.files[0];
     const data = new FormData();
     data.append('file', file );
     data.append('shopId', this.getShopId );
     this.productService.import(data).then(()=>{
        this.toasty.success(this.translate.instant('Import file success'));
     }).catch((err)=>{
        this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess));
     })     
  }

  templateCsv() {
    var now = new Date();
    let csvSheetData = [];
    var exportData = [];
          var data = new Object({
            'Loại SP': "",
            'Mã SAP': "",
            'Tên sản phẩm': "",
            'Giá bán WE': "",
            'ĐVT WE': "",
            'Giá bán NTD': "",
            'ĐVT NTD': "",
            'Ngôn ngữ': "",
            'SKU': "",
            'Khối lượng tịnh (KG)': "",
            'Qui cách đóng thùng': "",
            'Nhà SX': "",
            'Thành phần': "",
            'Hạn sử dụng': "",
            'Đặc điểm sản phẩm': "",
            'Quốc gia': "",
            'Kích hoạt': "",
            'Khuyến mãi': "",
          });
          exportData.push(data);
      csvSheetData.push(exportData);
      let introduceData = [];
      introduceData.push({"1. Cột kích hoạt: ": "- TRUE: kích hoạt sản phẩm"});
      introduceData.push({"1. Cột kích hoạt: ": "- FALSE: Không kích hoạt sản phẩm"});
      introduceData.push({"1. Cột kích hoạt: ": "2. Cột khuyến mãi: "});
      introduceData.push({"1. Cột kích hoạt: ": "- TRUE: Sản phẩm khuyến mãi và cột giá nhập 0"});
      introduceData.push({"1. Cột kích hoạt: ": "- FALSE: Sản phẩm bán"});
      csvSheetData.push(introduceData);

      this.productService.exportAsExcelFile_ManySheet(csvSheetData,["Danh sách sản phẩm", "Hướng dẫn nhập"], 'Template-mẫu-' + this.formatDateToString(now.toString()));
  }

  formatDateToString(current_datetime) {
    current_datetime = new Date(current_datetime);
    return current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " "
      + this.formatTime(current_datetime.getHours()) + ":" + this.formatTime(current_datetime.getMinutes()) + ":" + this.formatTime(current_datetime.getSeconds())
  }
  formatTime(time) {
    var strTime = '0' + time;
    return strTime.slice(strTime.length - 2, strTime.length);
  }

  
}
