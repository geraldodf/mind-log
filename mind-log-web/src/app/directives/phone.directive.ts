import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[appPhone]',
  standalone: true
})
export class PhoneDirective {

  private readonly maxLength = 11;

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent): void {
    let input = this.el.nativeElement.value;
    input = this.applyMask(input);
    this.el.nativeElement.value = input;
    this.control.control.setValue(input);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData.getData('text');
    let sanitizedValue = this.applyMask(clipboardData);

    event.preventDefault();
    this.el.nativeElement.value = sanitizedValue;
    this.control.control.setValue(sanitizedValue);
  }

  private applyMask(value: string): string {
    value = value.replace(/\D/g, '');

    if (value.length > this.maxLength) {
      value = value.substring(0, this.maxLength);
    }

    if (value.length <= 8) {
      return value.replace(/(\d{4})(\d{1,4})/, '$1-$2');
    } else if (value.length <= 10) {
      return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return value.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }

  }

}
