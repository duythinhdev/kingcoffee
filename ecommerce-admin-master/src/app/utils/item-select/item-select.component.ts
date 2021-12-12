import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import {Observable, Subject, merge} from 'rxjs';
import {debounceTime, map,distinctUntilChanged, filter,} from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../../shared/services';
import { TranslateService } from '@ngx-translate/core';
type State = {sap : string, name: string, id: string};
@Component({
  selector: 'item-select',
  templateUrl: './item-select.component.html',
  styleUrls: ['./item-select.component.scss'],

})
export class ItemSelectComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public searchText: any = '';
  public searchSap: any = '';
  public searchValue: any ;
  public statesWithFlags: any =[] ;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  @Input() keyChange: any = {sap:"",name:""};
  @Input() categoryId: string = '';
  @Input() isPromotion: boolean = false;
  @Input() valueUpdate: any="";
  @Input() isEdit: boolean = false;
  
  @Output() State = new EventEmitter<object>();
  @Output() arrState = new EventEmitter<object>();

  constructor(private commonService: CommonService,  private translate: TranslateService,private toasty: ToastrService, private utilService: UtilService) {}

  ngOnInit() {
    if(this.valueUpdate){
      this.keyChange = this.valueUpdate;
    }else{
      this.keyChange = {sap : "", name: ""}
    }
  }

  ngOnChanges(change: any) {
    const notUndefined = anyValue => typeof anyValue !== 'undefined';   
    if(change?.categoryId?.currentValue){
      this.toasty.clear();
      this.utilService.setLoading(true);
      if(this.categoryId && !this.isPromotion){
        const params: object = {
        page: this.page,
        take:10000,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        categoryId: this.categoryId ? this.categoryId : '',
      }
      this.commonService.search(params)
      .then(resp => {
        if(resp.data && resp.data.items){
          this.statesWithFlags = resp.data.items.map(item => {
            if (item?.sap && item?.category?.name && item?.name && item?._id) {
              return ({ 
                category: item?.category?.name, 
                sap: item?.sap,
                name: item?.name,
                id: item?._id
              })
            }
          }).filter(notUndefined);
          if(this.statesWithFlags.length){
            this.arrState.emit(this.statesWithFlags);
          }else{
            this.arrState.emit(this.statesWithFlags);
            this.toasty.error(this.translate.instant('There are no products in this category!'))
          }
        }
        this.utilService.setLoading(false); 
      })
      .catch(() => {
        this.utilService.setLoading(false);
        this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!')
      });
      }else if(this.isPromotion && this.categoryId){
        const params: object = {
        page: this.page,
        take:10000,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        categoryId: this.categoryId ? this.categoryId : '',
        isPromotion: true,
      }
      this.commonService.search(params)
      .then(resp => {
        if(resp.data && resp.data.items){
          this.statesWithFlags = resp.data.items.map(item => {
                if (item?.sap && item?.category?.name && item?.name && item?._id) {
                  return ({ 
                    category: item?.category?.name, 
                    sap: item?.sap,
                    name: item?.name,
                    id: item?._id
                  })
                }
              }).filter(notUndefined);
              if(this.statesWithFlags.length){
                this.arrState.emit(this.statesWithFlags);
              }else{
                this.arrState.emit(this.statesWithFlags);
                this.toasty.error(this.translate.instant('There are no products in this category!'))
              }
        }
        this.utilService.setLoading(false); 
      })
      .catch(() => {
        this.utilService.setLoading(false);
        this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!')
      });
      }
    }
  }

  searchChange(event){
    if(event.target.value){
      const notUndefined = anyValue => typeof anyValue !== 'undefined';
      let isnum = /^\d+$/.test(event.target.value);
      if(isnum){
        if(this.categoryId && !this.isPromotion){
          const params: object = {
            sap: event.target.value,
            page: this.page,
            take:10000,
            sort: `${this.sortOption.sortBy}`,
            sortType: `${this.sortOption.sortType}`,
            categoryId: this.categoryId ? this.categoryId : '',
        }
        this.commonService.search(params)
        .then(resp => {
          if(resp.data && resp.data.items){
            this.statesWithFlags = resp.data.items.map(item => 
              {
                if (item?.sap && item?.category?.name && item?.name && item?._id) {
                  return ({ 
                    category: item?.category?.name, 
                    sap: item?.sap,
                    name: item?.name,
                    id: item?._id
                  })
                }
              }).filter(notUndefined);
            this.arrState.emit(this.statesWithFlags)
          }
        })
        .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
        }else if(this.isPromotion && this.categoryId){
          const params: object = {
            sap: event.target.value,
            page: this.page,
            take:10000,
            sort: `${this.sortOption.sortBy}`,
            sortType: `${this.sortOption.sortType}`,
            categoryId: this.categoryId ? this.categoryId : '',
            isPromotion: true,
        }
        this.commonService.search(params)
        .then(resp => {
          if(resp.data && resp.data.items){
            this.statesWithFlags = resp.data.items.map(item => {
              if (item?.sap && item?.category?.name && item?.name && item?._id) {
                return ({ 
                  category: item?.category?.name, 
                  sap: item?.sap,
                  name: item?.name,
                  id: item?._id
                })
              }
            }).filter(notUndefined);
            this.arrState.emit(this.statesWithFlags)
          }
        })
        .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
        }
      }else{
        if(this.categoryId && !this.isPromotion){
          const params: object = {
          page: this.page,
          take:10000,
          q: event.target.value,
          sort: `${this.sortOption.sortBy}`,
          sortType: `${this.sortOption.sortType}`,
          categoryId: this.categoryId ? this.categoryId : '',
        }
        this.commonService.search(params)
        .then(resp => {
          if(resp.data && resp.data.items){
            this.statesWithFlags = resp.data.items.map(item => {
              if (item?.sap && item?.category?.name && item?.name && item?._id) {
                return ({ 
                  category: item?.category?.name, 
                  sap: item?.sap,
                  name: item?.name,
                  id: item?._id
                })
              }
            }).filter(notUndefined);
            this.arrState.emit(this.statesWithFlags)
          }
        })
        .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
        }else if(this.isPromotion && this.categoryId){
          const params: object = {
          page: this.page,
          take:10000,
          q: event.target.value,
          sort: `${this.sortOption.sortBy}`,
          sortType: `${this.sortOption.sortType}`,
          categoryId: this.categoryId ? this.categoryId : '',
          isPromotion: true,
        }
        this.commonService.search(params)
        .then(resp => {
          if(resp.data && resp.data.items){
            this.statesWithFlags = resp.data.items.map(item => {
              if (item?.sap && item?.category?.name && item?.name && item?._id) {
                return ({ 
                  category: item?.category?.name, 
                  sap: item?.sap,
                  name: item?.name,
                  id: item?._id
                })
              }
            }).filter(notUndefined);            
            this.arrState.emit(this.statesWithFlags)
          }
        })
        .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
        }
      }
    }
  }

  formatter = (x:State) => {
    this.State.emit(x)
    if(x?.sap && x?.name) return `${x.sap}-${x.name}`;
    return "";
  };

  search = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(500),
        map(term => term === '' ? []
          : this.statesWithFlags.filter(v => v.sap.toLowerCase().indexOf(term.toLowerCase()) || this.commonService.removeVietnameseTones(v.name.toLowerCase()).indexOf(term.toLowerCase())).slice(0, 10))
      )
}
