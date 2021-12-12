import { Component, EventEmitter, forwardRef, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-plus-minus-button',
  templateUrl: './plus-minus-button.component.html',
  styleUrls: ['./plus-minus-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlusMinusButtonComponent),
      multi: true,
    },
  ],
})
export class PlusMinusButtonComponent implements ControlValueAccessor {
  originValue: number;
  @Input() value = 1;
  @Output() changeValue = new EventEmitter<number>();
  // tslint:disable-next-line:no-any
  onChange = (_: any) => {};

  constructor() {}

  // tslint:disable-next-line:no-any
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // tslint:disable-next-line:no-any
  registerOnTouched(fn: any): void {}

  writeValue(value: number): void {
    this.value = value;
  }

  plus(): void {
    this.value++;
    this.onChange(this.value);
    this.changeValue.emit(this.value);
  }

  minus(): void {
    if (this.value <= 1) {
      this.value = 1;
    } else {
      this.value--;
      this.onChange(this.value);
      this.changeValue.emit(this.value);
    }
  }
  changeValueManual(event: any): void {
    if (+event.currentTarget.value === 0) {
      this.changeValue.emit(this.originValue);
    } else {
      this.value = event.currentTarget.value;
      this.changeValue.emit(this.value);
    }
  }
}
