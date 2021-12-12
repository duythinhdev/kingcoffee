import { Component, OnInit } from "@angular/core";
import {
  ApplyType,
  PromotionForm,
  UserRolesNew,
  PromotionRepeat,
  PromotionRepeatDay,
  PromotionStatus,
  PromotionFreeShipCondition,
} from "../../../enums/promotion.enum";
import { MediaService } from "../../../media/service";
import { PromotionModel } from "../../models/promotion.model";
import * as ClassicEditor from "../../../../assets/ckeditor/ckeditor";
import {
  NgbDate,
  NgbCalendar,
  NgbDateParserFormatter,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { PromotionService } from "../../services/promotion.service";
import { FormGroup, FormControl } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgbTime } from "../../../shared/models/time-picker.model";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";

@Component({
  selector: "promotion-detail",
  templateUrl: "./promotion-detail.component.html",
  styleUrls: ["./promotion-detail.component.scss"],
})
export class PromotionUpdateComponent implements OnInit {
  public promotionProgramType = []; //Promotion Program Type List
  public applyType = ApplyType;
  public promotionForm = PromotionForm;
  public promotionRepeat = PromotionRepeat;
  public promotionRepeatDay = PromotionRepeatDay;
  public rfPromotion: FormGroup;
  public show: boolean = false;
  public isActive: boolean = false;
  public promotionCode;
  public promotionName;
  public users: any;
  //user roles
  public userRoles = UserRolesNew;
  public dataListUserRoles = [];
  public changeArray = [];
  public userRoleSelect = [];
  //role apply select
  public dataRoleApply = [];
  public roleApplyList = [];
  public applyProduct = [];
  public applyOrder = [];
  public dropdownRoleSettings = {};
  public repeat = [];
  public dayRepeat = [];
  public dropdownAreaSettings = {};
  public dropdownDayRepeatSettings = {};
  public listUser = [];
  public idUpdate: any;
  // selectedItems = [];
  public conditionPromotion: string = "";
  public promotion: PromotionModel;
  public Editor = ClassicEditor;
  public ckEditorConfig: any;
  public content: any = "";
  public isEdit: boolean = false;
  public isEditObject: boolean = false;
  public notAllowEdit: boolean = true;
  public fromDate: any;
  public timeHUB: any;
  public isDisableTimeHub: boolean = false;
  public toDate: any | null = null;
  public minDate: any = null;
  public fromTime: NgbTime;
  public toTime: NgbTime;
  public timeTimeHUB: NgbTime;
  public showErrorTimeEndLoop: boolean = false;
  public checkRepeat: boolean = true;
  hoveredDate: NgbDate | null = null;

  constructor(
    private router: Router,
    private mediaService: MediaService,
    public formatter: NgbDateParserFormatter,
    private calendar: NgbCalendar,
    private promotionService: PromotionService,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.promotion = new PromotionModel();
    this.ckEditorConfig = this.mediaService.config;
  }

  ngOnInit() {
    //form
    let dateNow = new Date();
    let startDateCheck = "";
    let endDateCheck = "";
    let now = moment(dateNow).format("YYYY-MM-DD");
    let now2 = moment(dateNow).format("DD/MM/YYYY");
    this.minDate = this.showDate(now2, "setMinDate");
    this.rfPromotion = new FormGroup({
      promotionProgramType: new FormControl(),
      applyType: new FormControl(),
      promotionForm: new FormControl(),
    });
    this.query();
    this.idUpdate = this.route.snapshot.params.id;
    this.promotionService
      .findOnePromotion(this.idUpdate)
      .then((resp) => {
        this.promotion = resp.data;
        startDateCheck = moment(resp.data?.startDate).format("YYYY-MM-DD");
        endDateCheck = moment(resp.data?.endDate).format("YYYY-MM-DD");
        if (resp.data?.status === PromotionStatus.new) {
          this.isEdit = false;
        } else if (resp.data?.status === PromotionStatus.running) {
          this.isEdit = true;
          this.isEditObject = true;
        } else if (resp.data?.status === PromotionStatus.finish) {
          this.isEdit = true;
        } else if (resp.data?.status === PromotionStatus.stop) {
          this.isEdit = true;
        }
        let startDate = moment(resp.data?.startDate).format("DD/MM/YYYY");
        let endDate = moment(resp.data?.endDate).format("DD/MM/YYYY");
        let hubReceiveNoticeDate = moment(
          resp.data?.hubReceiveNoticeDate
        ).format("DD/MM/YYYY");
        this.fromDate = this.showDate(startDate, "setMinDate");
        this.toDate = this.showDate(endDate, "setMinDate");
        // this.timeHUB = this.showDate(hubReceiveNoticeDate, "noSet");

        //update time to timepicker variables
        const dStartDate = moment(resp.data?.startDate).toDate();
        this.fromTime = new NgbTime(
          dStartDate.getHours(),
          dStartDate.getMinutes()
        );
        const dEndDate = moment(resp.data?.endDate).toDate();
        this.toTime = new NgbTime(dEndDate.getHours(), dEndDate.getMinutes());
        // const dHubReceiveNoticeDate = moment(
        //   resp.data?.hubReceiveNoticeDate
        // ).toDate();
        // this.timeTimeHUB = new NgbTime(
        //   dHubReceiveNoticeDate.getHours(),
        //   dHubReceiveNoticeDate.getMinutes()
        // );

        const listUser = resp.data.applyMemberId.map((item) => ({
          CustomerNumber: item?.memberId,
          Name: item?.memberName,
          Mobile: item?.phoneNumber,
        }));
        this.listUser = listUser;
        this.conditionPromotion = resp.data.promotionForm;
        for (let i in this.promotionForm) {
          if (
            this.promotionForm[i] == "discountOrderForNewMember" ||
            this.promotionForm[i] == "orderDiscount" ||
            this.promotionForm[i] == "checkoutPercentOrMoneyDiscount" ||
            this.promotionForm[i] == "freeShip"
          ) {
            this.applyOrder.push(this.promotionForm[i]);
          } else {
            this.applyProduct.push(this.promotionForm[i]);
          }
        }
        this.rfPromotion.patchValue({
          promotionProgramType: resp.data?.promotionType?._id,
          applyType: resp.data?.applyType,
          promotionForm: resp.data?.promotionForm,
        });
        if (resp.data?.timeApplyConditionType == PromotionRepeat.everyday) {
          this.checkRepeat = false;
          this.promotion.dayRepeat = resp.data?.timeApply?.moments.map((x) => ({
            id: x,
            name: this.translate.instant(x),
          }));
          const getTimeStart = resp.data?.timeApply?.momentStartDate.split(":");
          this.promotion.timeStartLoop = {
            hour: parseInt(getTimeStart[0]),
            minute: parseInt(getTimeStart[1]),
          };
          const getTimeEnd = resp.data?.timeApply?.momentEndDate.split(":");
          this.promotion.timeEndLoop = {
            hour: parseInt(getTimeEnd[0]),
            minute: parseInt(getTimeEnd[1]),
          };
        }
      })
      .catch(() => this.toasty.error("Có vấn đề hệ thống, Vui lòng thử lại."));
    for (let i in this.userRoles) {
      if (this.userRoles[i] == "WE") {
        let role = 4;
        for (let x = 0; x < role; x++) {
          this.changeArray.push("WE " + x);
        }
      }
      if (this.userRoles[i] == "HUB") {
        this.changeArray.push(this.userRoles[i]);
      }
      if (this.userRoles[i] == "WE_MEMBER") {
        this.changeArray.push("WE MEMBER");
      }
    }
    for (let i in this.promotionRepeat) {
      this.repeat.push(this.promotionRepeat[i]);
    }
    for (let i in this.promotionRepeatDay) {
      this.dayRepeat.push({
        id: this.promotionRepeatDay[i],
        name: this.translate.instant(this.promotionRepeatDay[i]),
      });
    }
    this.dataListUserRoles = this.changeArray.map((x, i) => {
      return (x = {
        level: i,
        roleName: x,
      });
    });
    this.promotionService.getApplyArea().then((res) => {
      this.dataRoleApply = res.data.map((e, i) => {
        return (e = { id: e.Id, name: e.Name });
      });

      if (this.promotion.areaApply) {
        if (this.promotion.areaApply.find((x) => x.id == -1)) {
          this.promotion.areaApply = _.clone(this.dataRoleApply);
        }
      }
    });
    this.dropdownRoleSettings = {
      singleSelection: false,
      idField: "level",
      textField: "roleName",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };
    this.dropdownAreaSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };
    this.dropdownDayRepeatSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };

    this.show = true;
  }
  showDate(data, type: string) {
    let dd = data.split("/")[0].padStart(2, "0");
    let mm = data.split("/")[1].padStart(2, "0");
    let yyyy = data.split("/")[2].split(" ")[0];
    if (type == "setMinDate") {
      dd = parseInt(dd);
      mm = parseInt(mm);
      yyyy = parseInt(yyyy);
    }
    const valueDate: NgbDateStruct = { year: yyyy, month: mm, day: dd };
    return valueDate;
  }
  query() {
    let params = {
      take: 1000000,
      page: 1,
      // isActive:true
    };
    this.promotionService.getPromotionTypes(params).then((res) => {
      this.promotionProgramType = res.data?.items;
    });
  }
  createTable() {
    if (!this.promotion.applyRole || !this.promotion.applyRole.length) {
      return this.toasty.error("Vui lòng chọn Áp dụng role");
    }
    if (!this.users) {
      return this.toasty.error("Vui lòng nhập đối tượng");
    }
    let checkValidObject = /^\d+(?:[,]\d+)*?$/.test(this.users);
    if (!checkValidObject) {
      return this.toasty.error(
        "Đối tượng chỉ được nhập số và cách nhau bởi dấu phẩy"
      );
    }
    for (let index = 0; index < this.promotion.applyRole.length; index++) {
      let checkRole = this.promotion.applyRole[index].roleName;
      if (checkRole.includes("WE MEMBER")) {
        this.promotion.applyRole[index].role = this.userRoles.WE_MEMBER;
        this.promotion.applyRole[index].level = 0;
      } else if (checkRole.includes("WE")){
        this.promotion.applyRole[index].role = this.userRoles.WE;
      } else {
        this.promotion.applyRole[index].role = this.userRoles.HUB;
        this.promotion.applyRole[index].level = 0;
      }
    }
    const params = {
      CustomerNumber: this.users,
      role: this.promotion.applyRole,
    };
    this.promotionService
      .getListCustomer(params)
      .then((res) => {
        if (res.StatusCode == 200) {
          if (this.listUser.length == 0) {
            this.listUser = res.Data ? res.Data : [];
          } else {
            for (let index = 0; index < res.Data.length; index++) {
              const checkObjectExist = this.listUser.find(
                (x) => x?.CustomerNumber == res.Data[index].CustomerNumber
              );
              if (!checkObjectExist) {
                this.listUser.push(res.Data[index]);
              }
            }
          }
        } else {
          return this.toasty.error(res.Message);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
  removeObject(index: number) {
    this.listUser.splice(index, 1);
  }
  onItemSelect(item: any) {
    // console.log(item);
  }
  onSelectAll(items: any) {}
  onDropDownClose() {
    const checkHubExist = this.promotion.applyRole.find((x) => x?.level == 4);
    if (checkHubExist) {
      this.isDisableTimeHub = true;
    } else {
      this.isDisableTimeHub = false;
    }
  }
  onChangeRepeat() {
    this.promotion.dayRepeat = "";
    this.promotion.timeStartLoop = "";
    this.promotion.timeEndLoop = "";
    this.showErrorTimeEndLoop = false;
    this.promotion.timeApplyConditionType == PromotionRepeat.once
      ? (this.checkRepeat = true)
      : (this.checkRepeat = false);
  }
  // onChangeBudgetType(){
  //   this.promotion.numberRate = "";
  //   this.promotion.budgetType == PromotionBudgetType.unlimitedAllocation ? this.checkBudgetType = true : this.checkBudgetType = false;
  // }
  onChangeTimeEnd(event) {
    if (this.promotion.timeStartLoop && this.promotion.timeEndLoop) {
      if (this.promotion.timeEndLoop.hour < this.promotion.timeStartLoop.hour) {
        this.showErrorTimeEndLoop = true;
      } else if (
        this.promotion.timeEndLoop.hour == this.promotion.timeStartLoop.hour &&
        this.promotion.timeEndLoop.minute <= this.promotion.timeStartLoop.minute
      ) {
        this.showErrorTimeEndLoop = true;
      } else {
        this.showErrorTimeEndLoop = false;
      }
    }
  }
  editObject(edit: boolean, editObject: boolean, type: any) {
    if (editObject && type == "input") {
      return false;
    } else if (editObject && type == "other") {
      return true;
    } else if (edit && type == "input") {
      return true;
    } else if (edit && type == "other") {
      return false;
    } else if (!edit && !editObject && type == "input") {
      return false;
    } else if (!edit && !editObject && type == "other") {
      return true;
    }
    return false;
  }
  showForm() {
    this.conditionPromotion = this.rfPromotion.value?.promotionForm;
    this.show = true;
  }
  changePromotion(event) {
    this.show = false;
    this.promotion.discountOrderForNewMember = null;
    this.promotion.giveSomeGiftForNewMember = null;
    this.promotion.checkoutDiscount = null;
    this.promotion.discountOrderFollowProductQuantity = null;
    this.promotion.giveGiftForOrder = null;
    this.promotion.buyGoodPriceProduct = null;
    this.promotion.orderDiscount = null;
    this.promotion.productDiscount = null;
    this.promotion.checkoutPercentOrMoneyDiscount = null;
    this.promotion.bonusProducts = null;
    this.promotion.freeShip = null;
  }
  importDiscountOrderForNewMember(event) {
    this.promotion.discountOrderForNewMember = event;
  }
  importGiveSomeGiftForNewMember(event) {
    this.promotion.giveSomeGiftForNewMember = event;
  }
  importCheckoutDiscount(event) {
    this.promotion.checkoutDiscount = event;
  }
  importDiscountOrderFollowProductQuantity(event) {
    this.promotion.discountOrderFollowProductQuantity = event;
  }
  importGiveGiftForOrder(event) {
    this.promotion.giveGiftForOrder = event;
  }
  importBuyGoodPriceProduct(event) {
    this.promotion.buyGoodPriceProduct = event;
  }
  importOrderDiscount(event) {
    this.promotion.orderDiscount = event;
  }
  importProductDiscount(event) {
    this.promotion.productDiscount = event;
  }
  importCheckoutPercentOrMoneyDiscount(event) {
    this.promotion.checkoutPercentOrMoneyDiscount = event;
  }
  importBonusProducts(event) {
    this.promotion.bonusProducts = event;
  }
  importFreeShip(event) {
    this.promotion.freeShip = event;
  }
  submit() {
    let hourStart: any;
    let minuteStart: any;
    let hourEnd: any;
    let minuteEnd: any;
    let date = new Date();
    let startDate = "";
    let endDate = "";
    let year = 0;
    let month = 0;
    let day = 0;

    if (!this.promotion.code) {
      return this.toasty.error("Vui lòng điền Mã khuyến mãi");
    }
    if (!this.promotion.name) {
      return this.toasty.error("Vui lòng điền Tên khuyến mãi");
    }
    if (!this.promotion.name) {
      return this.toasty.error("Vui lòng điền Mô tả");
    }
    if (!this.fromDate || !this.toDate) {
      return this.toasty.error(
        "Vui lòng chọn thời gian bắt đầu và kết thúc khuyến mãi"
      );
    }

    if (this.promotion.timeApplyConditionType == PromotionRepeat.everyday) {
      if (
        this.promotion.timeStartLoop &&
        this.promotion.timeEndLoop &&
        this.promotion.dayRepeat
      ) {
        hourStart = this.promotion.timeStartLoop.hour;
        minuteStart = this.promotion.timeStartLoop.minute;
        hourEnd = this.promotion.timeEndLoop.hour;
        minuteEnd = this.promotion.timeEndLoop.minute;
        if (hourStart < 10) {
          hourStart = "0" + hourStart;
        }
        if (minuteStart < 10) {
          minuteStart = "0" + minuteStart;
        }
        if (hourEnd < 10) {
          hourEnd = "0" + hourEnd;
        }
        if (minuteEnd < 10) {
          minuteEnd = "0" + minuteEnd;
        }
        let timeStart = hourStart + ":" + minuteStart;
        let timeEnd = hourEnd + ":" + minuteEnd;
        this.promotion.timeApply = {
          moments: this.promotion.dayRepeat.map((x) => x.id),
          momentStartDate: timeStart,
          momentEndDate: timeEnd,
        };
      } else {
        return this.toasty.error(
          "Vui lòng chọn thời điểm, điền thời gian lặp lại bắt đầu và kết thúc"
        );
      }
    } else {
      this.promotion.timeApply = null;
    }

    if (this.fromDate.year && this.fromDate.month && this.fromDate.day) {
      year = this.fromDate.year;
      month = this.fromDate.month;
      day = this.fromDate.day;
      if (month == 1) {
        month = 0;
      } else {
        month = month - 1;
      }
      date = new Date(
        year,
        month,
        day,
        this.fromTime ? this.fromTime.hour : 0,
        this.fromTime ? this.fromTime.minute : 0
      );
      startDate = moment(date).utc().format("HH:mm DD-MM-YYYY");
    }

    if (this.toDate.year && this.toDate.month && this.toDate.day) {
      year = this.toDate.year;
      month = this.toDate.month;
      day = this.toDate.day;
      if (month == 1) {
        month = 0;
      } else {
        month = month - 1;
      }
      date = new Date(
        year,
        month,
        day,
        this.toTime ? this.toTime.hour : 23,
        this.toTime ? this.toTime.minute : 59
      );
      endDate = moment(date).utc().format("HH:mm DD-MM-YYYY");
    }
    if (this.promotion.areaApply.length == 0) {
      return this.toasty.error("Vui lòng chọn Vùng áp dụng");
    } else {
      if (this.promotion.areaApply.length == this.dataRoleApply.length) {
        this.promotion.areaApply = [
          {
            id: -1,
            name: "Tất cả",
          },
        ];
      } else {
        this.promotion.areaApply = this.promotion.areaApply.map((item) => ({
          id: item?.id,
          name: item?.name,
        }));
      }
    }
    if (this.promotion.applyRole.length == 0) {
      return this.toasty.error("Vui lòng chọn Áp dụng role");
    }
    for (let index = 0; index < this.promotion.applyRole.length; index++) {
      let checkRole = this.promotion.applyRole[index].roleName;
      if (checkRole.includes("WE MEMBER")) {
        this.promotion.applyRole[index].role = this.userRoles.WE_MEMBER;
        this.promotion.applyRole[index].level = 0;
      } else if (checkRole.includes("WE")){
        this.promotion.applyRole[index].role = this.userRoles.WE;
      } else {
        this.promotion.applyRole[index].role = this.userRoles.HUB;
        this.promotion.applyRole[index].level = 0;
      }
    }
    let listUsers;
    if (this.listUser.length == 0) {
      //return this.toasty.error('Danh sách đối tượng không được trống');
      listUsers = [];
    } else {
      listUsers = this.listUser.map((item) => {
        return {
          memberId: item?.CustomerNumber,
          memberName: item?.Name,
          phoneNumber: item?.Mobile,
        };
      });
    }
    // valid giveSomeGiftForNewMember

    if (this.conditionPromotion == PromotionForm.GiveSomeGiftForNewMember) {
      if (this.promotion.giveSomeGiftForNewMember) {
        if (
          this.promotion.giveSomeGiftForNewMember?.orderConditions.length == 0
        )
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        let checkOrderCondition = true;
        this.promotion.giveSomeGiftForNewMember?.orderConditions.map((x) => {
          if (!x?.totalOrderPriceCondition || !x?.orderNumber) {
            checkOrderCondition = false;
          }
        });
        if (!checkOrderCondition)
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        if (this.promotion.giveSomeGiftForNewMember?.gifts.length == 0)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng"
          );
        let checkGift = true;
        this.promotion.giveSomeGiftForNewMember?.gifts.map((y) => {
          if (!y?.gift || !y?.quantity) {
            checkGift = false;
          }
        });
        if (!checkGift)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng"
          );
        if (
          !this.promotion.giveSomeGiftForNewMember?.giveGiftType ||
          this.promotion.giveSomeGiftForNewMember?.promotionProducts.length == 0
        ) {
          return this.toasty.error("Vui lòng chọn sản phẩm được áp dụng");
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid discountOrderForNewMember
    if (this.conditionPromotion == PromotionForm.DiscountOrderForNewMember) {
      if (this.promotion.discountOrderForNewMember) {
        if (
          this.promotion.discountOrderForNewMember?.orderConditions.length == 0
        )
          return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
        let checkOrderCondition = true;
        this.promotion.discountOrderForNewMember?.orderConditions.map((x) => {
          if (
            !x?.totalOrderPriceCondition ||
            !x?.orderNumber ||
            !x?.discountPercent
          ) {
            checkOrderCondition = false;
          }
        });
        if (!checkOrderCondition)
          return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
        if (
          this.promotion.discountOrderForNewMember?.promotionProducts.length ==
          0
        )
          return this.toasty.error("Vui lòng chọn sản phẩm được áp dụng");
      } else {
        return this.toasty.error(
          "Vui lòng điền đầy đủ Điều kiện khuyến mãi và sản phẩm được áp dụng"
        );
      }
    }
    // valid checkoutDiscount
    if (this.conditionPromotion == PromotionForm.CheckoutDiscount) {
      if (this.promotion.checkoutDiscount) {
        if (!this.promotion.checkoutDiscount?.orderQuantity) {
          if (this.promotion.checkoutDiscount?.promotionProducts.length == 0)
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          let checkArrProduct = true;
          this.promotion.checkoutDiscount?.promotionProducts.map((x) => {
            if (!x?.product || !x?.quantity) {
              checkArrProduct = false;
            }
          });
          if (!checkArrProduct) {
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          }
        }
        if (this.promotion.checkoutDiscount?.gifts.length == 0)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng "
          );
        let checkGift = true;
        this.promotion.checkoutDiscount?.gifts.map((x) => {
          if (!x?.gift || !x?.quantity) {
            checkGift = false;
          }
        });
        if (!checkGift)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng "
          );
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid discountOrderFollowProductQuantity
    if (
      this.conditionPromotion ==
      PromotionForm.DiscountOrderFollowProductQuantity
    ) {
      if (this.promotion.discountOrderFollowProductQuantity) {
        if (
          !this.promotion.discountOrderFollowProductQuantity?.discountPercent ||
          !this.promotion.discountOrderFollowProductQuantity?.orderQuantity
        ) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (
          this.promotion.discountOrderFollowProductQuantity?.promotionProducts
            .length == 0
        ) {
          return this.toasty.error("Vui lòng chọn sản phẩm được áp dụng");
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid productDiscount
    if (this.conditionPromotion == PromotionForm.ProductDiscount) {
      if (this.promotion.productDiscount) {
        if (this.promotion.productDiscount.length == 0)
          return this.toasty.error("Vui lòng chọn sản phẩm được giảm giá");
        let checkProduct = true;
        this.promotion.productDiscount.map((x) => {
          if (!x?.productId || !x?.discountPercent) {
            checkProduct = false;
          }
        });
        if (!checkProduct)
          return this.toasty.error("Vui lòng điền đầy đủ giảm giá sản phẩm");
      } else {
        return this.toasty.error("Vui lòng chọn sản phẩm được giảm giá");
      }
    }
    // valid buyGoodPriceProduct
    if (this.conditionPromotion == PromotionForm.BuyGoodPriceProduct) {
      if (this.promotion.buyGoodPriceProduct) {
        if (!this.promotion.buyGoodPriceProduct?.totalOrderPriceCondition) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (this.promotion.buyGoodPriceProduct?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng");
        if (this.promotion.buyGoodPriceProduct?.goodPriceProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm ưu đãi");
        let checkProduct = true;
        this.promotion.buyGoodPriceProduct?.goodPriceProducts.map((x) => {
          if (!x?.product || !x?.discountOnProductPercent) {
            checkProduct = false;
          }
        });
        if (!checkProduct)
          return this.toasty.error("Vui lòng chọn và điền Sản phẩm ưu đãi");
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid orderDiscount
    if (this.conditionPromotion == PromotionForm.OrderDiscount) {
      if (this.promotion.orderDiscount) {
        if (
          !this.promotion.orderDiscount?.discountOrderValue ||
          !this.promotion.orderDiscount?.totalOrderPriceCondition
        ) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (this.promotion.orderDiscount?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng");
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi đơn hàng");
      }
    }
    // freeship
    if (this.conditionPromotion == PromotionForm.FreeShip) {
      if (this.promotion.freeShip) {
        if (
          !this.promotion.freeShip?.totalOrderPriceCondition ||
          !this.promotion.freeShip?.shippingPriceDiscount ||
          !this.promotion.freeShip?.applyType
        ) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (
          this.promotion.freeShip?.applyType ==
            PromotionFreeShipCondition.currentOrder &&
          this.promotion.freeShip?.totalOrderPriceCondition >= 1000000
        )
          return this.toasty.error(
            "Giá trị đơn sau chiết khấu phải nhỏ hơn 1.000.000đ khi chọn đơn hiện tại"
          );
        if (
          this.promotion.freeShip?.applyType ==
          PromotionFreeShipCondition.anotherOrder
        ) {
          if (
            !this.promotion.freeShip?.applyStartDate ||
            !this.promotion.freeShip?.applyEndDate
          )
            return this.toasty.error(
              "Vui lòng chọn Hạn sử dụng cho Điều kiện khuyến mãi"
            );
        }
        if (this.promotion.freeShip?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng");
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi đơn hàng");
      }
      delete this.promotion.freeShip['userApply'];
    }
    // CheckoutPercentOrMoneyDiscount
    if (
      this.conditionPromotion == PromotionForm.CheckoutPercentOrMoneyDiscount
    ) {
      if (this.promotion.checkoutPercentOrMoneyDiscount) {
        if (
          !this.promotion.checkoutPercentOrMoneyDiscount?.orderQuantity &&
          this.promotion.checkoutPercentOrMoneyDiscount?.discountOrderValue
        ) {
          if (
            this.promotion.checkoutPercentOrMoneyDiscount?.promotionProducts
              .length == 0
          )
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          let checkArrProduct = true;
          this.promotion.checkoutPercentOrMoneyDiscount?.promotionProducts.map(
            (x) => {
              if (!x?.product || !x?.quantity) {
                checkArrProduct = false;
              }
            }
          );
          if (!checkArrProduct) {
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          }
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi đơn hàng");
      }
    }
    // GiveGiftForOrder
    if (this.conditionPromotion == PromotionForm.GiveGiftForOrder) {
      if (this.promotion.giveGiftForOrder) {
        if (!this.promotion.giveGiftForOrder?.totalOrderPriceCondition)
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        if (this.promotion.giveGiftForOrder?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng ");
        if (this.promotion.giveGiftForOrder?.gifts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm/ Vật phẩm tặng");
        let checkArrProduct = true;
        this.promotion.giveGiftForOrder?.gifts.map((x) => {
          if (!x?.gift || !x?.quantity) {
            checkArrProduct = false;
          }
        });
        if (!checkArrProduct) {
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng "
          );
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi sản phẩm");
      }
    }
    // BonusProducts
    if (this.conditionPromotion == PromotionForm.BonusProducts) {
      if (this.promotion.bonusProducts) {
        if (
          !this.promotion.bonusProducts?.orderQuantity ||
          !this.promotion.bonusProducts?.bonusQuantity
        ) return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
          if (
            this.promotion.bonusProducts?.promotionProducts
              .length == 0
          )
            return this.toasty.error(
              "Vui lòng chọn Sản phẩm được áp dụng "
            );
          let checkArrProduct = true;
          this.promotion.bonusProducts?.promotionProducts.map(
            (x) => {
              if (!x?.product || !x?.bonusProduct) {
                checkArrProduct = false;
              }
            }
          );
          if (!checkArrProduct) {
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi sản phẩm");
      }
    }

    // if (this.timeHUB) {
    //   if (this.timeHUB.year && this.timeHUB.month && this.timeHUB.day) {
    //     year = this.timeHUB.year;
    //     month = this.timeHUB.month;
    //     day = this.timeHUB.day;
    //     if (month == 1) {
    //       month = 0;
    //     } else {
    //       month = month - 1;
    //     }
    //     date = new Date(
    //       year,
    //       month,
    //       day,
    //       this.timeTimeHUB ? this.timeTimeHUB.hour : 0,
    //       this.timeTimeHUB ? this.timeTimeHUB.minute : 0
    //     );
    //     this.promotion.hubReceiveNoticeDate = moment(date)
    //       .utc()
    //       .format("HH:mm DD-MM-YYYY");
    //   }
    // }
    this.promotion.applyRole = this.promotion.applyRole.map((item) => ({
      level: item?.level,
      role: item?.role,
      roleName: item?.roleName,
    }));

    this.promotion.startDate = startDate;
    this.promotion.endDate = endDate;
    this.promotion.applyMemberId = listUsers;
    (this.promotion.promotionTypeId = this.rfPromotion.value?.promotionProgramType),
      (this.promotion.applyType = this.rfPromotion.value?.applyType),
      (this.promotion.promotionForm = this.conditionPromotion)
    const data = _.pick(this.promotion, [
      "applyMemberId",
      "applyRole",
      "applyType",
      "areaApply",
      "code",
      "content",
      "endDate",
      "isActive",
      "isRejectApplyMemberId",
      "name",
      "promotionForm",
      "promotionTypeId",
      "startDate",
      "timeApplyConditionType",
      "timeApply",
      this.conditionPromotion,
    ]);
    this.promotionService
      .updatePromotion(this.idUpdate, data)
      .then((res) => {
        this.toasty.success("Cập nhật thành công");
        if (this.promotion.areaApply) {
          if (this.promotion.areaApply.find((x) => x.id == -1)) {
            this.promotion.areaApply = _.clone(this.dataRoleApply);
          }
        }
        this.router.navigate(["/promotions/list"]);
      })
      .catch((err) =>
        this.toasty.error(
          this.translate.instant(
            err.error.code == 422
              ? err.error.data.details[0].message
              : err.error.message
          )
        )
      );
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  onDateSelection(date: NgbDate) {
    if(this.isEditObject){
      this.toDate = null;
       if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
        this.toDate = date;
      }
    }else{
      if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }
}

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  formatTimePickerValue(value: NgbTime) {
    if (value) {
      return `${String("00" + value.hour).slice(-2)}:${String(
        "00" + value.minute
      ).slice(-2)} `;
    } else {
      return "";
    }
  }

  onDateHUBSelection(date: NgbDate) {
    if (date) {
      this.timeHUB = date;
    }
  }
}
