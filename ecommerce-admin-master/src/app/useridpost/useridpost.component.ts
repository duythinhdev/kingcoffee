import {Component, OnInit} from '@angular/core';
import {UserIdService} from './service';
import {Router, ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {BannerListTitle, BannerListTitleModel} from '../model/banner.listing.title.model';
import {userIdCreateTitle, UserIdCreateTitleModel} from '../model/userId.create.title.model';
import {ErrorTitle, ErrorTitleModel} from '../model/error.title.model';
import {TranslateService} from '@ngx-translate/core';
import {BannerType} from '../enums/banner.enum';

// @Component({
//   templateUrl: './banners.html'
// })
// export class UseridComponent implements OnInit {
//   errorTitleModel: ErrorTitleModel;
//   public items = [];
//   public page = 1;
//   public total = 0;
//   public title: string = '';
//   bannerListTitleModel: BannerListTitleModel;
//
//   constructor(private router: Router, private UserIdService: UserIdService,
//               private toasty: ToastrService, private translate: TranslateService) {
//   }
//
//   ngOnInit() {
//     this.errorTitleModel = ErrorTitle[0];
//     this.bannerListTitleModel = BannerListTitle[0];
//     this.query();
//   }
//
//   query() {
//     this.UserIdService.search({
//       page: this.page,
//       title: this.title
//     })
//       .then(resp => {
//         this.items = resp.data.items;
//         this.total = resp.data.count;
//       })
//       .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
//   }
//
//   onSearch() {
//     this.page = 1;
//     this.query();
//   }
//
//   keyPress(event: any) {
//     if (event.charCode === 13) {
//       this.query();
//     }
//   }
//
//   remove(item: any, index: number) {
//     if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
//       this.UserIdService.remove(item._id)
//         .then(() => {
//           this.query();
//           this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
//           this.items.splice(index, 1);
//         })
//         .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
//     }
//   }
// }

@Component({
  templateUrl: './form.html'
})
export class UserIdCreateComponent implements OnInit {
  public memberIds: any = {
    type: 'all',
    title: '',
    description: '',
    memberId:'',
  };
  public str: any = ",";
  UserIdCreateTitle: UserIdCreateTitleModel;
  constructor(private router: Router, private UserIdService: UserIdService, private toasty: ToastrService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.UserIdCreateTitle = UserIdCreateTitleModel[0];
  }
  async submit() {
    if (!this.memberIds.title) {
      return this.toasty.error(
        "Vui Lòng Nhập các Trường"
        // this.translate.instant('Please enter notification name')
      );
    }
      await this.UserIdService.create({
        type: this.memberIds.type,
        title: this.memberIds.title,
        body: this.memberIds.description,
        memberIds: this.memberIds.memberId.replaceAll(" ","").split(","),
      })
        .then(() => {
          if(this.memberIds.memberId){
            this.toasty.success(
              "Tạo Mới Thông Báo Thành Công"
              // this.translate.instant('notification has been created')
            );
          }
          this.router.navigate(['/userids']);
        }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!'))).catch(
          (error)=>{ this.toasty.error(this.translate.instant(error))});
    }
  // }
}

// @Component({
//   templateUrl: './form.html'
// })
// export class BrandUpdateComponent implements OnInit {
//   bannerCreateTitleModel: UserIdCreateTitleModel;
//   public media: any;
//   //just upload file with type is image
//   public mediaOptions = {
//     mediaType: 'image'
//   };
//   public userids: any = {
//     name: '',
//     alias: '',
//     description: '',
//     settings: {},
//     position: 'Home',
//     isActive: false
//   };
//   public postions: any = [];
//   public bannerType = BannerType;
//
//   constructor(private router: Router, private route: ActivatedRoute, private UserIdService: UserIdService, private toasty: ToastrService,
//               private translate: TranslateService) {
//   }
//
//   ngOnInit() {
//     for (let i in this.bannerType) {
//       this.postions.push(this.bannerType[i]);
//     }
//     this.bannerCreateTitleModel = userIdCreateTitle[0];
//     let bannerId = this.route.snapshot.paramMap.get('id');
//     this.UserIdService.findOne(bannerId)
//       .then(resp => {
//         this.userids = resp.data;
//         if (resp.data.media) {
//           this.media = resp.data.media;
//           this.userids.mediaId = resp.data.media._id;
//           this.userids.positon = resp.data.positon;
//         }
//       });
//   }
//
//   selectMedia(media: any) {
//     this.media = media;
//   }
//
//   submit(frm: any) {
//     if (!this.userids.title) {
//       return this.toasty.error(this.translate.instant('Please enter banner name'));
//     }
//
//     if (this.media) {
//       this.userids.mediaId = this.media._id;
//     } else {
//       return this.toasty.error(this.translate.instant('Please browse banner image'));
//     }
//
//     this.UserIdService.update(this.userids._id, this.userids)
//       .then(() => {
//         this.toasty.success('Cập nhật thành công');
//         this.router.navigate(['/userids']);
//       }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!')));
//   }
// }
