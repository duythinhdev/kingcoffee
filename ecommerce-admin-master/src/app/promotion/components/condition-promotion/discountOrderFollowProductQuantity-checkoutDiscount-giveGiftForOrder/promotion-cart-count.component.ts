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
import { ToastrService } from "ngx-toastr";
import { TotalOrderPriceConditionType } from "../../../../enums/promotion.enum";
// type State = {sap : string, name: string, id: string};
@Component({
  selector: "promotion-cart-count",
  templateUrl: "./promotion-cart-count.component.html",
  styleUrls: ["./promotion-cart-count.component.scss"],
})
export class PromotionCartCountComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public valueProduct: any;
  public product: any;
  public getAllProduct: any;
  public productPresent: any;
  public getAllProductPresent: any;
  public gift: any;
  public arrProduct: any = [];
  public arrProductPresent: any = [];
  public category: any = "";
  public giveGiftType: any = "or";
  public checkValueQuantity = false;
  public categoryPresent: any = "";
  public orderQuantity: number;
  public totalOrderPriceConditionType: string;
  public TotalOrderPriceConditionType = TotalOrderPriceConditionType;
  public discountPercent: number;
  public tree: any = [];
  public treeGift: any = [];
  public titleCondition: any;
  public keychange: any = { sap: "", name: "" };
  public keychangePresent: any = { sap: "", name: "" };
  public nameCondition: any;
  public nameChildCondition: any;
  public maximumTotalGift = 0;
  public maximumTotalGiftPerUser = 0;
  public hasProgressive = true;
  public typeCondition: any = [
    {
      title: "Condition promotion",
      name: "Shopping cart with quantity",
      nameChild: "Product donation",
    },
    {
      title: "Condition promotion",
      name: "Buy in quantity",
      nameChild: "Promotion(%)",
    },
    {
      title: "Condition promotion",
      name: "Single value after discount",
      nameChild: "Product donation",
    },
  ];
  public sortOption = {
    sortBy: "createdAt",
    sortType: "desc",
  };

  public typePromotion: string;
  @Input() set funcPromotion(value: string) {
    if (value == "checkoutDiscount") {
      this.titleCondition = this.typeCondition[0].title;
      this.nameCondition = this.typeCondition[0].name;
      this.nameChildCondition = this.typeCondition[0].nameChild;
    } else if (value == "discountOrderFollowProductQuantity") {
      this.titleCondition = this.typeCondition[1].title;
      this.nameCondition = this.typeCondition[1].name;
      this.nameChildCondition = this.typeCondition[1].nameChild;
    } else if (value == "giveGiftForOrder") {
      this.titleCondition = this.typeCondition[2].title;
      this.nameCondition = this.typeCondition[2].name;
      this.nameChildCondition = this.typeCondition[2].nameChild;
    }
    this.typePromotion = value;
  }
  get funcPromotion(): string {
    return this.typePromotion;
  }
  public isEdit: boolean = false;
  public childValue: any;
  @Input() checkEdit: any;
  @Input() valueUpdate: any;
  @Input() idUpdate: any;
  @Output() valuePromotionCartCount = new EventEmitter<object>();

  constructor(
    private promotionService: PromotionService,
    private toasty: ToastrService
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
    if (
      this.valueUpdate &&
      this.idUpdate &&
      this.typePromotion == "checkoutDiscount"
    ) {
      this.arrProduct = this.valueUpdate?.promotionProducts.map((item) => ({
        category: item?.product?.category?.name,
        name: item?.product?.name,
        sap: item?.product?.sap,
        quantity: item?.quantity,
        id: item?.product?.id,
      }));
      this.giveGiftType = this.valueUpdate?.giveGiftType;
      this.orderQuantity = this.valueUpdate?.orderQuantity;
      this.arrProductPresent = this.valueUpdate?.gifts.map((item) => ({
        category: item?.gift?.category?.name,
        name: item?.gift?.name,
        sap: item?.gift?.sap,
        quantity: item?.quantity,
        id: item?.gift?.id,
      }));
    } else if (
      this.valueUpdate &&
      this.idUpdate &&
      this.typePromotion == "giveGiftForOrder"
    ) {
      this.arrProduct = this.valueUpdate?.promotionProducts.map((item) => ({
        category: item?.category?.name,
        name: item?.name,
        sap: item?.sap,
        id: item?.id,
      }));
      this.giveGiftType = this.valueUpdate?.giveGiftType;
      this.orderQuantity = this.valueUpdate?.totalOrderPriceCondition;
      this.totalOrderPriceConditionType = this.valueUpdate?.totalOrderPriceConditionType;
      this.arrProductPresent = this.valueUpdate?.gifts.map((item) => ({
        category: item?.gift?.category?.name,
        name: item?.gift?.name,
        sap: item?.gift?.sap,
        quantity: item?.quantity,
        id: item?.gift?.id,
        maximumQuantity: item?.maximumQuantity,
      }));
      this.maximumTotalGift = this.valueUpdate?.maximumTotalGift;
      this.maximumTotalGiftPerUser = this.valueUpdate?.maximumTotalGiftPerUser;
      this.hasProgressive = this.valueUpdate?.hasProgressive;
    } else if (
      this.valueUpdate &&
      this.idUpdate &&
      this.typePromotion == "discountOrderFollowProductQuantity"
    ) {
      this.arrProduct = this.valueUpdate?.promotionProducts.map((item) => ({
        category: item?.category?.name,
        name: item?.name,
        sap: item?.sap,
        id: item?.id,
      }));
      this.orderQuantity = this.valueUpdate?.orderQuantity;
      this.discountPercent = this.valueUpdate?.discountPercent;
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
    this.changePromotionCartCount();
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
    this.changePromotionCartCount();
  }
  importProduct(event) {
    this.product = event;
    this.changePromotionCartCount();
  }
  importArrProduct(event) {
    this.getAllProduct = event;
  }
  importProductGiven(event) {
    this.gift = event;
    this.changePromotionCartCount();
  }
  importProductPresent(event) {
    this.productPresent = event;
  }

  importArrProductPresent(event) {
    this.getAllProductPresent = event;
  }
  onCheckPercent(event: any) {
    if (event.target.value < 0 || event.target.value > 100) {
      return this.toasty.error("Phần trăm khuyến mãi chỉ từ 0-100");
    } else {
      this.toasty.clear();
    }
  }
  remove(index: number) {
    this.arrProduct.splice(index, 1);
    this.changePromotionCartCount();
  }
  removeAllProduct() {
    this.arrProduct = [];
    this.changePromotionCartCount();
  }
  removeAllGift() {
    this.arrProductPresent = [];
    this.changePromotionCartCount();
  }
  removePresent(index: number) {
    this.arrProductPresent.splice(index, 1);
    this.changePromotionCartCount();
  }

  changePromotionCartCount() {
    if (this.typePromotion == "discountOrderFollowProductQuantity") {
      this.valuePromotionCartCount.emit({
        promotionProducts: this.arrProduct.map((item) => item?.id),
        orderQuantity: this.orderQuantity,
        discountPercent: this.discountPercent,
      });
    } else if (this.typePromotion == "checkoutDiscount") {
      if (this.orderQuantity) {
        this.checkValueQuantity = true;
        this.arrProduct.map((item) => (item.quantity = null));
      } else {
        this.checkValueQuantity = false;
        this.orderQuantity = null;
      }
      this.valuePromotionCartCount.emit({
        promotionProducts: this.arrProduct.map((item) => ({
          product: item?.id,
          quantity: item?.quantity,
        })),
        orderQuantity: this.orderQuantity,
        giveGiftType: this.giveGiftType,
        gifts: this.arrProductPresent.map((itemGift) => ({
          gift: itemGift?.id,
          quantity: itemGift?.quantity,
        })),
      });
    } else if (this.typePromotion == "giveGiftForOrder") {
      this.valuePromotionCartCount.emit({
        promotionProducts: this.arrProduct.map((item) => item?.id),
        totalOrderPriceCondition: this.orderQuantity,
        totalOrderPriceConditionType: this.totalOrderPriceConditionType,
        giveGiftType: this.giveGiftType,
        gifts: this.arrProductPresent.map((itemGift) => ({
          gift: itemGift?.id,
          quantity: itemGift?.quantity,
          maximumQuantity: itemGift?.maximumQuantity,
        })),
        maximumTotalGift: this.maximumTotalGift,
        maximumTotalGiftPerUser: this.maximumTotalGiftPerUser,
        hasProgressive: this.hasProgressive,
      });
    }
  }

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
