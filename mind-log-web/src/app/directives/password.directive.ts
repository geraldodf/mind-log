import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[appPassword]',
  standalone: true
})
export class PasswordDirective {

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    let input = this.el.nativeElement.value;
    input = input.replace(' ', '');
    this.el.nativeElement.value = input;
    this.control.control.setValue(input);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData.getData('text');
    let sanitizedValue = clipboardData.replace(' ', '');
    event.preventDefault();
    this.el.nativeElement.value = sanitizedValue;
    this.control.control.setValue(sanitizedValue);
  }

}
