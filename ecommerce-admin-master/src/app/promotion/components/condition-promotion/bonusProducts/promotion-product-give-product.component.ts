import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  ChangeDetectorRef,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Observable, Subject, merge } from "rxjs";
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
import { NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { PromotionService } from "../../../services/promotion.service";
import { CommonService } from "../../../../utils/services/common.service";
import { ToastrService } from "ngx-toastr";
import { UtilService } from "../../../../shared/services";
import { TotalOrderPriceConditionType } from "../../../../enums/promotion.enum";
type State = { sap: string; name: string; id: string };
@Component({
  selector: "promotion-product-give-product",
  templateUrl: "./promotion-product-give-product.component.html",
  styleUrls: ["./promotion-product-give-product.component.scss"],
})
export class PromotionProductGiveProductComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public valueProduct: any;
  public product: any;
  public getAllProduct: any;
  public productGiven: any;
  public arrProduct: any = [];
  public category: any = "";
  public discountOrderPercent: number;
  public orderQuantity: number;
  public totalOrderPriceCondition: number;
  public totalOrderPriceConditionType: number;
  public maximumTotalGift: number;
  public maximumTotalGiftPerUser: number;
  public tree: any = [];
  public treeGift: any = [];
  public keychange: any = { sap: "", name: "" };
  public nameCondition: any;
  public isEdit: boolean = false;
  public statesWithFlags: any = [];
  public TotalOrderPriceConditionType = TotalOrderPriceConditionType;
  public sortOption = {
    sortBy: "createdAt",
    sortType: "desc",
  };
  public productPresent: any;
  public getAllProductPresent: any;
  public arrProductPresent: any = [];
  public categoryPresent: any = "";
  public keychangePresent: any = { sap: "", name: "" };
  @Input() checkEdit: any;
  @Input() valueUpdate: any;
  @Input() idUpdate: any;
  @Output() valuePromotionProductGiveProduct = new EventEmitter<object>();

  constructor(
    private promotionService: PromotionService,
    private toasty: ToastrService,
    private commonService: CommonService,
    private utilService: UtilService
  ) {}

  ngOnInit() {
    this.promotionService
      .tree({ isActive: true, isPromotion: false })
      .then(
        (resp) => (this.tree = this.promotionService.prettyPrint(resp.data))
      );
    this.promotionService
      .tree({ isActive: true, isPromotion: true })
      .then(
        (resp) => (this.treeGift = this.promotionService.prettyPrint(resp.data))
      );
    if (this.checkEdit && this.idUpdate) {
      this.isEdit = true;
    }
    if (this.valueUpdate && this.idUpdate) {
      this.arrProduct = this.valueUpdate?.promotionProducts.map((item) => ({
        category: item?.product?.category?.name,
        name: item?.product?.name,
        sap: item?.product?.sap,
        productId: {
          sap: item?.bonusProduct?.sap,
          name: item?.bonusProduct?.name,
          id: item?.bonusProduct?.id,
        },
        id: item?.product?.id,
      }));
      this.orderQuantity = this.valueUpdate?.orderQuantity;
      this.totalOrderPriceCondition = this.valueUpdate?.totalOrderPriceCondition;
      this.totalOrderPriceConditionType = this.valueUpdate?.totalOrderPriceConditionType;
      this.discountOrderPercent = this.valueUpdate?.bonusQuantity;
      this.maximumTotalGift = this.valueUpdate?.maximumTotalGift;
      this.maximumTotalGiftPerUser = this.valueUpdate?.maximumTotalGiftPerUser;
    }
  }

  addProduct() {
    if (!this.category) {
      return this.toasty.error("Vui lòng chọn loại sản phẩm!");
    }
    if (!this.product) {
      return this.toasty.error("Chưa có sản phẩm nào, Vui lòng thử lại!");
    }
    if (this.category && !this.product?.id) {
      for (let index = 0; index < this.getAllProduct.length; index++) {
        const checkArrExist = this.arrProduct.find(
          (x) => x?.id == this.getAllProduct[index].id
        );
        if (!checkArrExist) {
          this.arrProduct.push(this.getAllProduct[index]);
        }
      }
    }
    if (this.product?.id) {
      const checkProductExist = this.arrProduct.find(
        (x) => x?.id == this.product?.id
      );
      if (checkProductExist) {
        this.keychange = { sap: "", name: "" };
        return this.toasty.error("Sản phẩm đã tồn tại");
      } else {
        this.keychange = { sap: "", name: "" };
        this.arrProduct.push(this.product);
      }
    }
    this.changePromotionProductGiveProduct();
  }
  addProductPresent() {
    if (!this.categoryPresent) {
      return this.toasty.error("Vui lòng chọn loại sản phẩm!");
    }
    if (!this.productPresent) {
      return this.toasty.error("Chưa có sản phẩm nào, Vui lòng thử lại!");
    }
    if (this.categoryPresent && !this.productPresent?.id) {
      for (let index = 0; index < this.getAllProductPresent.length; index++) {
        const checkArrExist = this.arrProductPresent.find(
          (x) => x?.id == this.getAllProductPresent[index].id
        );
        if (!checkArrExist) {
          this.arrProductPresent.push(this.getAllProductPresent[index]);
        }
      }
    }
    if (this.productPresent?.id) {
      const checkProductExist = this.arrProductPresent.find(
        (x) => x?.id == this.productPresent?.id
      );
      if (checkProductExist) {
        this.keychangePresent = { sap: "", name: "" };
        return this.toasty.error("Sản phẩm đã tồn tại");
      } else {
        this.keychangePresent = { sap: "", name: "" };
        this.arrProductPresent.push(this.productPresent);
      }
    }
    this.changePromotionProductGiveProduct();
  }
  onCheckPercent(event: any) {
    if (event.target.value < 0 || event.target.value > 100) {
      return this.toasty.error("Phần trăm sản phẩm ưu đãi chỉ từ 0-100");
    } else {
      this.toasty.clear();
    }
  }
  importProduct(event) {
    this.product = event;
  }
  importArrProduct(event) {
    this.getAllProduct = event;
  }
  importProductPresent(event) {
    this.productPresent = event;
  }

  importArrProductPresent(event) {
    this.getAllProductPresent = event;
  }
  remove(index: number) {
    this.arrProduct.splice(index, 1);
    this.changePromotionProductGiveProduct();
  }
  removeAll() {
    this.arrProduct = [];
    this.changePromotionProductGiveProduct();
  }
  removePresent(index: number) {
    this.arrProductPresent.splice(index, 1);
    this.changePromotionProductGiveProduct();
  }
  changePromotionProductGiveProduct() {
    const arrProducts = this.arrProduct.map((item) => ({
      product: item?.id,
      bonusProduct: item?.productId?.id,
    }));
    this.valuePromotionProductGiveProduct.emit({
      orderQuantity: this.orderQuantity,
      bonusQuantity: this.discountOrderPercent,
      promotionProducts: arrProducts,
      totalOrderPriceCondition: this.totalOrderPriceCondition,
      totalOrderPriceConditionType: this.totalOrderPriceConditionType,
      maximumTotalGift: this.maximumTotalGift,
      maximumTotalGiftPerUser: this.maximumTotalGiftPerUser,
    });
  }
  searchChange(event) {
    const notUndefined = (anyValue) => typeof anyValue !== "undefined";
    let isnum = /^\d+$/.test(event.target.value);
    let params: object = {};
    if (event.target.value) {
      this.utilService.setLoading(true);
      if (isnum) {
        params = {
          page: this.page,
          take: 10000,
          sap: event.target.value,
          sort: `${this.sortOption.sortBy}`,
          sortType: `${this.sortOption.sortType}`,
          categoryId: "",
          isPromotion: true,
        };
      } else {
        params = {
          page: this.page,
          take: 10000,
          q: event.target.value,
          sort: `${this.sortOption.sortBy}`,
          sortType: `${this.sortOption.sortType}`,
          categoryId: "",
          isPromotion: true,
        };
      }
      this.promotionService
        .search(params)
        .then((resp) => {
          if (resp.data && resp.data.items) {
            this.statesWithFlags = resp.data.items
              .map((item) => {
                if (item?.sap && item?.name && item?._id) {
                  return {
                    sap: item?.sap,
                    name: item?.name,
                    id: item?._id,
                  };
                }
              })
              .filter(notUndefined);
          }
          this.utilService.setLoading(false);
        })
        .catch(() => {
          this.utilService.setLoading(false);
          this.toasty.error("Có vấn đề hệ thống, Vui lòng thử lại!");
        });
      this.changePromotionProductGiveProduct();
    }
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map((term) =>
        term === ""
          ? []
          : this.statesWithFlags
              .filter(
                (v) =>
                  v.sap.toLowerCase().indexOf(term.toLowerCase()) ||
                  this.commonService
                    .removeVietnameseTones(v.name.toLowerCase())
                    .indexOf(term.toLowerCase())
              )
              .slice(0, 10)
      )
    );
  formatter = (x: State) => {
    this.changePromotionProductGiveProduct();
    return `${x.sap}-${x.name}`;
  };

  currencyInputChanged(value) {
    var num = value.replace(/[,]/g, "");
    return Number(num);
  }

  kd_checkNumber(event) {
    if (
      !(
        (event.which >= 48 && event.which <= 57) ||
        (event.which >= 96 && event.which <= 105)
      ) &&
      event.which != 8 &&
      event.which != 46 &&
      event.which != 37 &&
      event.which != 39
    ) {
      event.preventDefault();
    }
  }
}
