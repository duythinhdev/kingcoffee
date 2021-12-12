import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service'
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {
    
	@Input() layout;
    pageInfo;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private authService: AuthService
    ) {
        this
        .router.events
        .filter(event => event instanceof NavigationEnd)
        .map(() => this.activatedRoute)
        .map(route => {
            while (route.firstChild) route = route.firstChild;
            return route;
        })
        .filter(route => route.outlet === 'primary')
        .mergeMap(route => route.data)
        .subscribe((event) => {
            if(Object.keys(event).length != 0){
                this.authService.getPermission().then((resp)=>{
                    const getLinkUrl = event?.urls[0]?.url;
                    const sliceLink = getLinkUrl.slice(1);
                    if(sliceLink != 'home' && sliceLink != 'not-found'){
                        const checkPermission = resp.data.permissions?.PermissionItems.find(x=>x.Key.toLowerCase() === sliceLink || x.Key === "Full");
                        this.titleService.setTitle(event['title']);
                        this.pageInfo = event;
                        if(!checkPermission){
                            this.titleService.setTitle(event['title']);
                            this.pageInfo = {title: ''};
                            this.router.navigate(['/permission']);
                        }
                    }else{
                        this.pageInfo = {title: ''};
                    }
                }).catch((err)=>console.log(err))
            }
        });
    }
    ngOnInit() { }
}
