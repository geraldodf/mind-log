import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {marked} from "marked";

@Pipe({
  name: 'safeMarkdown',
  standalone: true
})
export class SafeMarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    const html = marked(value || '');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
