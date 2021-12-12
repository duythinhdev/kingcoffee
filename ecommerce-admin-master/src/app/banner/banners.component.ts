import { Component, OnInit } from '@angular/core';
import { BannerService } from './service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BannerListTitle, BannerListTitleModel } from '../model/banner.listing.title.model';
import { BannerCreateTitle, BannerCreateTitleModel } from '../model/banner.create.title.model';
import { ErrorTitle, ErrorTitleModel } from '../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';
import { BannerType } from '../enums/banner.enum';

@Component({
  templateUrl: './banners.html'
})
export class BannersComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public items = [];
  public page = 1;
  public total = 0;
  public title: string = '';
  bannerListTitleModel: BannerListTitleModel;
  constructor(private router: Router, private bannerService: BannerService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.bannerListTitleModel = BannerListTitle[0];
    this.query();
  }

  query() {
    this.bannerService.search({
      page: this.page,
      title: this.title
    })
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  onSearch() {
    this.page = 1;
    this.query();
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  remove(item: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.bannerService.remove(item._id)
        .then(() => {
          this.query();
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }
}

@Component({
  templateUrl: './form.html'
})
export class BrandCreateComponent implements OnInit {
  public banner: any = {
    name: '',
    alias: '',
    description: '',
    settings: {},
    position: 'Home',
    isActive: false
  };
  public media: any;
  public postions: any = [];
  bannerCreateTitleModel: BannerCreateTitleModel;
  public bannerType = BannerType;
  //just upload file with type is image
  public mediaOptions = {
    mediaType: 'image'
  };

  constructor(private router: Router, private bannerService: BannerService, private toasty: ToastrService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    for (let i in this.bannerType) {
      this.postions.push(this.bannerType[i]);
  }
    this.bannerCreateTitleModel = BannerCreateTitle[0];
  }

  selectMedia(media: any) {
    this.media = media;
  }

  submit(frm: any) {
    if (!this.banner.title) {
      return this.toasty.error(this.translate.instant('Please enter banner name'));
    }

    if (this.media) {
      this.banner.mediaId = this.media._id;
    } else {
      return this.toasty.error(this.translate.instant('Please browse banner image'));
    }
    
    this.bannerService.create(this.banner)
      .then(() => {
        this.toasty.success(this.translate.instant('Banner has been created'));
        this.router.navigate(['/banners']);
      }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!')));
  }
}

@Component({
  templateUrl: './form.html'
})
export class BrandUpdateComponent implements OnInit {
  bannerCreateTitleModel: BannerCreateTitleModel;
  public media: any;
  //just upload file with type is image
  public mediaOptions = {
    mediaType: 'image'
  };
  public banner: any = {
    name: '',
    alias: '',
    description: '',
    settings: {},
    position: 'Home',
    isActive:false
  };
  public postions: any = [];
  public bannerType = BannerType;
  constructor(private router: Router, private route: ActivatedRoute, private bannerService: BannerService, private toasty: ToastrService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    for (let i in this.bannerType) {
      this.postions.push(this.bannerType[i]);
  }
    this.bannerCreateTitleModel = BannerCreateTitle[0];
    let bannerId = this.route.snapshot.paramMap.get('id');
    this.bannerService.findOne(bannerId)
      .then(resp => {
        this.banner = resp.data;
        if (resp.data.media) {
          this.media = resp.data.media;
          this.banner.mediaId = resp.data.media._id;
          this.banner.positon = resp.data.positon;
        }
      });
  }

  selectMedia(media: any) {
    this.media = media;
  }

  submit(frm: any) {
    if (!this.banner.title) {
      return this.toasty.error(this.translate.instant('Please enter banner name'));
    }

    if (this.media) {
      this.banner.mediaId = this.media._id;
    } else {
      return this.toasty.error(this.translate.instant('Please browse banner image'));
    }

    this.bannerService.update(this.banner._id, this.banner)
      .then(() => {
        this.toasty.success('Cập nhật thành công');
        this.router.navigate(['/banners']);
      }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!')));
  }
}
