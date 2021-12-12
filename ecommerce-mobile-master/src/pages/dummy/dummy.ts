import { Component } from '@angular/core';

/**
 * Generated class for the DummyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dummy',
  templateUrl: 'dummy.html'
})
export class DummyComponent {

  text: string;

  constructor() {
    console.log('Hello DummyComponent Component');
    this.text = 'Hello World';
  }

}
