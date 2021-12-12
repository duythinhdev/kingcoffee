import { Component, OnInit } from '@angular/core';
import { ROUTES } from './menu-items';
import { Router } from '@angular/router';
import { AuthService } from '../services';
declare var $: any;
@Component({
  selector: 'ap-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  isSp: boolean = false;
  showMenu: any = '';
  showSubMenu: any = '';
  public isShowMenu: any = false;
  public sidebarnavItems: any[];
  public listlang:  any[];
  public dashboard: string;
  // this is for the open close
  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }
  addActiveClass(element: any) {
    if (element === this.showSubMenu) {
      this.showSubMenu = '0';
    } else {
      this.showSubMenu = element;
    }
  }
  constructor(private router: Router, private authService: AuthService) {
  }
  // End open close
  ngOnInit() {
    const notUndefined = anyValue => typeof anyValue !== 'undefined';
   this.isSp = $(window).width() < 769 ? true : false;
   this.authService.getPermission().then((resp)=>{
     const checkPermission = resp.data?.permissions?.PermissionItems.find(x=> x.Key === "Full");
     if(checkPermission){
       this.sidebarnavItems = ROUTES.filter(sidebarnavItem => sidebarnavItem);
    }else{
      const getPermission = resp.data?.permissions?.PermissionItems.map(x=>{
        return {
          id:x.Id,
          key:x.Key
        }
      });
      getPermission.sort(function(a, b) {
        return a.id - b.id;
      });
      let arrSidebar = [];
      for (const iterator of getPermission) {
        let slashString = `/${iterator.key.toLowerCase()}`;
        let getNavItem = ROUTES.map(sidebarnavItem => {
          if(sidebarnavItem.path === slashString){
            return sidebarnavItem;
          }
        }).filter(notUndefined);
        if(getNavItem[0]){
          arrSidebar.push(getNavItem[0])
        }
      }
      let getItemLogout = ROUTES.map(sidebarnavItem => {
        if(sidebarnavItem.path === '/profile/update'){
          return sidebarnavItem;
        }
      }).filter(notUndefined);
      arrSidebar.push(getItemLogout[0]);
      this.sidebarnavItems = arrSidebar;
      console.log("sidebarnavItems",this.sidebarnavItems);
    }

    }).catch((err)=>console.log(err))


    $(function () {
      $('.sidebartoggler').on('click', function () {
        if ($('#main-wrapper').hasClass('mini-sidebar')) {
          $('body').trigger('resize');
          $('#main-wrapper').removeClass('mini-sidebar');
        } else {
          $('body').trigger('resize');
          $('#main-wrapper').addClass('mini-sidebar');
        }
      });
    });
  }

  // logout() {
  //   // localStorage.removeItem('listlang');
  //   this.authService.removeToken();
  //   this.router.navigate(['/auth/login']);
  // }

  showDropdown() {
    this.isShowMenu = !this.isShowMenu;
  }
}
