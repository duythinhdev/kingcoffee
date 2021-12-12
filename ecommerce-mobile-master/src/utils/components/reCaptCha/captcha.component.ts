import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  NgZone,
  ViewChild,
  ElementRef,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ReCaptchaService } from '../../../services/captcha.service';

@Component({
  selector: 're-captcha',
  template: '<div #target></div>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReCaptchaComponent),
      multi: true,
    },
  ],
})
export class ReCaptchaComponent implements OnInit, ControlValueAccessor {
  @Input() site_key: string = undefined;
  @Input() theme = 'light';
  @Input() type = 'image';
  @Input() size = 'normal';
  @Input() tabindex = 0;
  @Input() badge = 'bottomright';
  /* Available languages: https://developers.google.com/recaptcha/docs/language */
  @Input() language: string = undefined;
  @Input() global = false;

  @Output() captchaResponse = new EventEmitter<string>();
  @Output() captchaExpired = new EventEmitter();
  @Output() loaded = new EventEmitter<boolean>();

  @ViewChild('target') targetRef: ElementRef;
  widgetId;

  onChange: Function = () => {};
  onTouched: Function = () => {};

  constructor(
    private _zone: NgZone,
    private _captchaService: ReCaptchaService
  ) {}

  ngOnInit() {
    this._captchaService
      .getReady(this.language, this.global)
      .subscribe((ready) => {
        if (!ready) {
          return;
        }
        // noinspection TypeScriptUnresolvedVariable,TypeScriptUnresolvedFunction
        this.widgetId = (window as any).grecaptcha.render(
          this.targetRef.nativeElement,
          {
            sitekey: this.site_key,
            badge: this.badge,
            theme: this.theme,
            type: this.type,
            size: this.size,
            tabindex: this.tabindex,
            callback: ((response) =>
              this._zone.run(
                this.recaptchaCallback.bind(this, response)
              )) as any,
            'expired-callback': (() =>
              this._zone.run(this.recaptchaExpiredCallback.bind(this))) as any,
          }
        );
        setTimeout(() => {
          this.loaded.emit(true);
        }, 0);
      });
  }

  // noinspection JSUnusedGlobalSymbols
  reset() {
    if (this.widgetId === null) {
      return;
    }
    // noinspection TypeScriptUnresolvedVariable
    this._zone.runOutsideAngular(
      (window as any).grecaptcha.reset.bind(this.widgetId)
    );
    this.onChange(undefined);
  }

  // noinspection JSUnusedGlobalSymbols
  execute() {
    if (this.widgetId === null) {
      return;
    }
    // noinspection TypeScriptUnresolvedVariable
    (window as any).grecaptcha.execute(this.widgetId);
  }

  getResponse(): string {
    if (this.widgetId === null) {
      return undefined;
    }
    // noinspection TypeScriptUnresolvedVariable
    return (window as any).grecaptcha.getResponse(this.widgetId);
  }

  writeValue(newValue): void {
    /* ignore it */
  }

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  registerOnTouched(fn): void {
    this.onTouched = fn;
  }

  private recaptchaCallback(response: string) {
    this.onChange(response);
    this.onTouched();
    this.captchaResponse.emit(response);
  }

  private recaptchaExpiredCallback() {
    this.onChange(undefined);
    this.onTouched();
    this.captchaExpired.emit();
  }
}
