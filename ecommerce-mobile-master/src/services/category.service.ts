import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { find } from 'lodash';

@Injectable()
export class CategoryService {
  // flag to prevent load tree multiple times
  private loadingTree;

  constructor(private restangular: Restangular, private http: HttpClient) {}

  tree() {
    if (this.loadingTree) {
      return this.loadingTree;
    }

    this.loadingTree = this.restangular
      .one('products/categories', 'tree')
      .get()
      .toPromise()
      .then((resp) => {
        this.loadingTree = undefined;
        return resp.data;
      });

    return this.loadingTree;
  }

  getFlatTree(tree) {
    let result = [];
    tree.forEach((item) => {
      result.push(item);

      if (item.children) {
        result = result.concat(this.getFlatTree(item.children));
      }
    });

    return result;
  }

  getBreadcrumbs(tree, id: string) {
    const parents = [];
    const flatTrees = this.getFlatTree(tree);

    const item = find(flatTrees, (a) => [a.alias, a._id].indexOf(id) > -1);
    if (!item) {
      return [];
    }

    let flag = item;
    for (const iterator of flatTrees) {
      const parent = find(flatTrees, (x) => x._id === flag.parentId);
      if (!parent) {
        continue;
      }

      parents.unshift(parent);
      flag = parent;
    }
    return {
      item,
      parents,
    };
  }

  findInTree(tree, id: string) {
    const array = this.getFlatTree(tree);
    return find(array, (a) => [a.alias, a._id].indexOf(id) > -1);
  }
}
