import { Directive, ElementRef, HostListener } from '@angular/core';
@Directive({
  selector: '[oneDigitDecima]'
})
export class OneDecimaDirective {
  public text: string;

  private regex: RegExp = new RegExp(/^(\d{0,2})?([.]?\d?)?$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete', 'Control', 'c', 'v'];
  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      if (this.specialKeys.indexOf(event.key) === 0) {
        this.el.nativeElement.value = "";
      }
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);

    if(next.includes('.')){
      if(this.text == next){
        event.preventDefault();
      }
      this.text= next;
    }
    if ((next && !String(next).match(this.regex))) {  
      event.preventDefault();
    }
  }
}