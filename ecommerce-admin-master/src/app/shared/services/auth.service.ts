import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { loginData } from '../../model/login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public accessToken: string = null;
  public currentUser = null;
  private userLoaded = new Subject<any>();
  public userLoaded$ = this.userLoaded.asObservable();

  constructor(private restangular: Restangular) { }

  getCurrentUser() {
    if (this.currentUser) {
      return new Promise(resolve => resolve(this.currentUser));
    }

    return this.restangular.one('users', 'me').get().toPromise()
      .then((resp) => {
        this.currentUser = resp.data;
        return resp.data;
      });
  }

  getPermission() {
    return this.restangular.one('users', 'me').get().toPromise()
  }

  // login(credentials: any): Promise<any> {
  //   return this.restangular.all('auth/login').post(credentials).toPromise()
  //   .then((resp) => {
  //     localStorage.setItem('accessToken', resp.data.token);
  //     return this.restangular.one('users', 'me').get().toPromise()
  //       .then(resp => {
  //         if (resp.data.role !== 'admin') {
  //           this.removeToken();
  //           throw 'Invalid role!';
  //         }

  //         this.currentUser = resp.data;
  //         localStorage.setItem('isLoggedin', 'yes');
  //         return resp.data;
  //       });
  //   });
  // }

  login(credentials: any): Promise<any> {
    return this.restangular.all('auth/login').post(credentials).toPromise()
      .then((resp) => {
        loginData[0].code = resp.code;
        if(resp.code == 200){
          localStorage.setItem('accessToken', resp.data.token);
          return this.restangular.one('users', 'me').get().toPromise()
            .then(resp => {
              this.currentUser = resp.data;
              localStorage.setItem('isLoggedin', 'yes');
              localStorage.setItem('userName', resp.data.name);
              this.userLoaded.next(resp.data);
              return resp.data;
            });
        }
      });
  }

  getAccessToken(): any {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }

    return this.accessToken;
  }

  forgot(email: string): Promise<any> {
    return this.restangular.all('auth/forgot').post({ email }).toPromise();
  }

  removeToken() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isLoggedin');
  }

  isLoggedin() {
    return localStorage.getItem('isLoggedin') === 'yes';
  }
}
