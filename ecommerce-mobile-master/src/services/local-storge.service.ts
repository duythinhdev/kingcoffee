import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorgeService {
  set(key: string, value) {
    localStorage.setItem(key, value);
  }

  get(key: string) {
    return localStorage.getItem(key);
  }

  clear() {
    localStorage.clear();
  }
}
