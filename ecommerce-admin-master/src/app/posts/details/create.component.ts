import { Component, OnInit } from "@angular/core";
import { PostService } from "../services/service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  PostCreateTitleModel,
  PostCreateTitle,
} from "../../model/post.create.title.model";
import { TranslateService } from "@ngx-translate/core";
import * as ClassicEditor from "../../../assets/ckeditor/ckeditor";
import { MediaService } from "../../media/service";
import { CommonService } from "../../utils/services/common.service";

@Component({
  templateUrl: "./form.html",
})
export class PostCreateComponent implements OnInit {
  public categoriesParam: object = {
    page: 1,
    take: 10000,
  };
  public categories = [];
  public item: any = {
    title: "",
    content: "",
    isMain: false,
    isActive: false,
    description: "",
    categoryIds: [],
    // type: "all",
  };
  public type: string = "all";
  public isAll: boolean = false;
  public selectedCategory = "";
  postCreateTitleModel: PostCreateTitleModel;
  public Editor = ClassicEditor;
  public ckEditorConfig: any;
  public isPage: boolean = false;
  public isUpdating = false;
  public tab: any = "info";
  public images: any = [];
  public mainImage: any = "";
  public imagesOptions: any = {
    multiple: true,
  };

  constructor(
    private router: Router,
    private postService: PostService,
    private toasty: ToastrService,
    private translate: TranslateService,
    private mediaService: MediaService,
    private commonService: CommonService
  ) {
    this.ckEditorConfig = this.mediaService.config;
  }

  ngOnInit() {
    this.postCreateTitleModel = PostCreateTitle[0];
    if (this.postService.categories.length > 0) {
      this.categories = this.postService.categories;
    } else {
      this.postService.getCategories(this.categoriesParam).then((resp) => {
        this.categories = resp.data.items;
        this.postService.categories = resp.data.items;
      });
    }
  }

  async submit(frm: any) {
    if (!frm.valid) {
      return this.toasty.error("Có vấn đề hệ thống, Vui lòng thử lại");
    }

    if (this.selectedCategory === "") {
      return this.toasty.error("Vui lòng chọn danh mục");
    }

    if (this.mainImage !== "") {
      this.item.image = this.mainImage;
    }
    this.item.categoryIds.push(this.selectedCategory);

    var powerby = this.item.content.toLowerCase().lastIndexOf(`powered by`);
    var name = this.item.content
      .toLowerCase()
      .lastIndexOf(`title="froala editor"`);
    if (powerby > 0 && name > 0) {
      var begin = this.item.content.lastIndexOf("<p");
      this.item.content = this.item.content.slice(0, begin);
    }

    await this.postService
      .create(this.item)
      .then((resp) => {
        this.toasty.success(this.translate.instant("Created successfully!"));
        this.goBack();
      })
      .catch((e) => this.toasty.error(e.data.message));
    this.item.categoryIds = [];

    if (this.isAll === true) {
      await this.submitCreateNotification();
    }
  }

  submitCreateNotification() {
    this.postService
      .createNotification({
        type: this.type,
        title: this.item.title,
        body: this.item.content,
      })
      .then((resp) => {
        this.toasty.success(
           "Tạo Mới Thông Báo Tất Cả Thành Công"
          // this.translate.instant("Created successfully Notification!")
        );
        this.goBack();
      })
      .catch((e) => {
        this.toasty.error(e.data.message);
      });
  }

  goBack() {
    this.router.navigate(["/posts/posts-list"]);
  }

  changeTab(type: string) {
    this.tab = type;
  }

  selectImage(media: any) {
    // this.product.mainImage = media._id;
    // this.imageUrl = media.fileUrl;
    if (media.type !== "photo") {
      return this.toasty.error(this.translate.instant("Please select image!"));
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
    this.item.alias = this.commonService.generateAlias(
      this.item.title.toLowerCase()
    );
  }
}
