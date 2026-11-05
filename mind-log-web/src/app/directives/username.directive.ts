import {Directive, HostListener} from '@angular/core';
import {NgControl} from "@angular/forms";

// Funciona tanto num `<input>` quanto num componente de formulário
// (ex.: `<app-form-input username>`): os eventos chegam por bubbling e o
// campo real é sempre `event.target`.
@Directive({
  selector: '[username]',
  standalone: true
})
export class UsernameDirective {

  private regex: RegExp =/[^a-z0-9._]/g;
  constructor(private control: NgControl) {}

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    const input = field.value.toLowerCase().replace(this.regex, '');
    field.value = input;
    this.control.control.setValue(input);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    const field = event.target as HTMLInputElement;
    const sanitizedValue = event.clipboardData.getData('text').toLowerCase().replace(this.regex, '');

    event.preventDefault();
    field.value = sanitizedValue;
    this.control.control.setValue(sanitizedValue);
  }

}
