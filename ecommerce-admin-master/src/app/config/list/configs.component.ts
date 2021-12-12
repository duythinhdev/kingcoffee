import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service';
import { ToastrService } from 'ngx-toastr';
import { ConfigListTitle, ConfigListTitleModel } from '../../model/config.listing.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'configs',
  templateUrl: './configs.html',
  styleUrls: ['./configs.component.scss']
})
export class ConfigsComponent implements OnInit {
  configListTitleModel: ConfigListTitleModel;
  public items = [];
  constructor(private configService: ConfigService, private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.configListTitleModel = ConfigListTitle[0];
    this.query();
  }

  query() {
    this.configService.list()
      .then(resp => {
        this.items = resp.data.items;
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  save(item: any) {
    if (item.type === 'number' && item.value < 0) {
      return this.toasty.error(this.translate.instant('Please enter positive number!'));
    }

    this.configService.update(item._id, item.value)
      .then(() => this.toasty.success(this.translate.instant('Updated successfully!')))
      .catch(e => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  // saveMaintenance(item){
  //   console.log(this.isActivedMaintenance)
  //   this.configService.update(item._id, item.value)
  //   .then(() => this.toasty.success(this.translate.instant('Updated successfully!')))
  //   .catch(e => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  // }

  selectMedial(media: any, index: number) {
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image mime type.'));
    }
    this.items[index].value = media.fileUrl;
  }

  addSEOThumbnail(media: any) {
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image mime type.'));
    }

    let seo = this.items.find(x => x.key === "homeSEO");
    if (seo && seo.value) {
      seo.value.thumbnail = media.fileUrl;
    }
  }

  addHomeBannerThumbnail(media: any, currentThumbnail: any) {
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image mime type.'));
    }

    let seo = this.items.find(x => x.key === "homeMiddleBanner");
    if (seo && seo.value) {
      for (const iterator of seo.value) {
        if(iterator.thumbnail === currentThumbnail){
          iterator.thumbnail = media.fileUrl;
        }
      }
    }
  }

  selectIcon(media: any, index: number) {
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image mime type.'));
    }
    this.items[index].value.iconUrl = media.fileUrl;
  }
}
