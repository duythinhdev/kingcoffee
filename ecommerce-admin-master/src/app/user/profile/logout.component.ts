import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import * as _ from 'lodash';

@Component({
  selector: 'profile-update',
  template:'',
})
export class LogoutComponent implements OnInit {
  public info: any = {};
  public avatarUrl = '';
  public isSubmitted = false;
  public avatarOptions: any = {};
  public user: any = {};
  private userId: string;

  constructor(private router: Router, private authService: AuthService){ }

  ngOnInit() {
    // logout account
    this.authService.removeToken();
    this.router.navigate(['/auth/login']);
    }
  }
