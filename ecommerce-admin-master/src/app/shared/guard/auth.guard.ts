import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services';
import { UserRoles } from '../enums/UserRoles.enum';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private Auth: AuthService) { }

  canActivate() {
    if (!this.Auth.isLoggedin()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return this.Auth.getCurrentUser()
      .then(resp => {
        const canActive = resp !== null && resp.userRoles.find(x => x.RoleName === UserRoles.Admin != null);
        if (!canActive) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        return true;
      });
  }
}
