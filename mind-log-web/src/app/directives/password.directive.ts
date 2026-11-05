import {Directive, HostListener} from '@angular/core';
import {NgControl} from "@angular/forms";

// Funciona tanto num `<input>` quanto num componente de formulário
// (ex.: `<app-form-input appPassword>`): os eventos chegam por bubbling e o
// campo real é sempre `event.target`.
@Directive({
  selector: '[appPassword]',
  standalone: true
})
export class PasswordDirective {

  constructor(private control: NgControl) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    const input = field.value.replace(' ', '');
    field.value = input;
    this.control.control.setValue(input);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    const field = event.target as HTMLInputElement;
    const sanitizedValue = event.clipboardData.getData('text').replace(' ', '');
    event.preventDefault();
    field.value = sanitizedValue;
    this.control.control.setValue(sanitizedValue);
  }

}
