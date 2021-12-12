import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BannerListTitle, BannerListTitleModel } from '../model/banner.listing.title.model';
import { BannerCreateTitle, BannerCreateTitleModel } from '../model/banner.create.title.model';
import { TranslateService } from '@ngx-translate/core';
import { BannerType } from '../enums/banner.enum';

@Component({
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  public username = "bạn";
  constructor(private router: Router, private toasty: ToastrService, private translate: TranslateService) {
    const getUsername = localStorage.getItem('userName');
    if(getUsername){
      this.username = getUsername
    }
  }

  ngOnInit() {
    
  }


}
