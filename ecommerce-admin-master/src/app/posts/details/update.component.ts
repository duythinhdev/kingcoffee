import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {PostCreateTitleModel, PostCreateTitle } from '../../model/post.create.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as ClassicEditor from '../../../assets/ckeditor/ckeditor';
import { MediaService } from '../../media/service';
import { CommonService } from '../../utils/services/common.service';

@Component({
  templateUrl: './form.html'
})
export class PostUpdateComponent implements OnInit {
  public item: any = {};
  postCreateTitleModel: PostCreateTitleModel;
  public Editor = ClassicEditor;
  public ckEditorConfig : any;
  public selectedCategory: String = '';
  public categories: any = [];
  public categoriesParam: Object = {
    page: 1,
    take: 10000
  }

  public isPage = false;
  public tab: any = 'info';
  public images: any = [];
  public mainImage: any = '';
  public imagesOptions: any = {
    multiple: true
  };
  public isUpdating = true;

  constructor(private router: Router, private route: ActivatedRoute, private postService: PostService, private toasty: ToastrService,
    private translate: TranslateService, private mediaService: MediaService, private commonService: CommonService) {
    this.ckEditorConfig =  this.mediaService.config;
  }

  ngOnInit() {
    this.postCreateTitleModel= PostCreateTitle[0];
    const id = this.route.snapshot.params.id;
    this.postService.findOne(id).then(resp => {
      this.item = resp.data;
      this.selectedCategory = this.item.categoryIds[0];
      if(this.item.type === 'page') {
        this.isPage = true;
      }
      this.mainImage = resp.data.image && resp.data.image._id ? resp.data.image._id : null;
      if(this.mainImage) {
        this.images.push(resp.data.image);
      }
    })
    .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại.'));

    if(this.postService.categories.length > 0) {
      this.categories = this.postService.categories;
    } else {
      this.postService.getCategories(this.categoriesParam).then(resp => {
        this.categories = resp.data.items;
        this.postService.categories = resp.data.items;
      })
    }
  }

  submit(frm: any) {
    if (!frm.valid) {
      return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại');
    }

    if (this.selectedCategory === '' && this.isPage === false) {
      return this.toasty.error('Vui lòng chọn danh mục');
    }

    if (this.isPage) {
      this.item.type = 'page';
    } else {
      this.item.type = 'post';
    }

    if (this.mainImage !== '') {
      this.item.image = this.mainImage;
    }

    if (this.item.categoryIds[0] !== this.selectedCategory) {
      this.item.categoryIds[0] = this.selectedCategory;
    }

    var powerby = this.item.content.toLowerCase().lastIndexOf(`powered by`);
    var name = this.item.content.toLowerCase().lastIndexOf(`title="froala editor"`);
    if(powerby > 0 && name > 0){
      var begin = this.item.content.lastIndexOf("<p");
      this.item.content = this.item.content.slice(0, begin);
    }

    const data = _.pick(this.item, ['title', 'alias', 'content', 'description', 'isActive', 'isMain', 'categoryIds', 'type', 'image']);
    this.postService.update(this.item._id, data)
      .then(resp => {
        this.toasty.success(this.translate.instant('Updated successfully!'));
        this.goBack();
      })
      .catch((e) => this.toasty.error(e.data.message));
  }

  goBack() {
    if(this.isPage) {
      this.router.navigate(['/posts/pages-list']);
    } else {
      this.router.navigate(['/posts/posts-list'])
    }
  }

  changeTab(type: string) {
    this.tab = type;
  }

  selectImage(media: any) {
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image!'));
    }

    this.images.push(media);
  }

  setMain(media: any) {
    this.mainImage = media._id;
  }

  removeImage(media: any, index: any) {
    if (media._id === this.mainImage) {
      this.mainImage = null;
    }
    this.images.splice(index, 1);
  }

  changeAlias() {
    if(!this.isPage){
      this.item.alias = this.commonService.generateAlias(this.item.title.toLowerCase());
    }
  }
}
