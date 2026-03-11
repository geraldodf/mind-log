import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[username]',
  standalone: true
})
export class UsernameDirective {

  private regex: RegExp =/[^a-z0-9._]/g;
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event']) onInput(event: Event): void {
    let input = this.el.nativeElement.value;
    input = input.toLowerCase()
    input = input.replace(this.regex, '');
    this.el.nativeElement.value = input;
    this.control.control.setValue(input);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData.getData('text');
    clipboardData = clipboardData.toLowerCase();
    let sanitizedValue = clipboardData.replace(this.regex, '');

    event.preventDefault();
    this.el.nativeElement.value = sanitizedValue;
    this.control.control.setValue(sanitizedValue);
  }

}
