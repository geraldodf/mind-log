import {AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, Output, Renderer2} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {QuillModule} from "ngx-quill";
import Quill from "quill";

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [FormsModule, QuillModule],
  template: '<div [attr.id]="editorId" [style.height]="editorHeight"></div>',
  styles: [`
    .ql-editor {
      overflow-y: scroll;
      resize: vertical;
      min-height: 150px;
    }
  `],
})
export class QuillEditorComponent implements AfterViewInit {
  @Input() content: string;
  @Input() editorId: string;
  @Input() editorHeight: string = '40vh';
  @Output() contentChange = new EventEmitter<string>();

  private quill: Quill;
  private elementRef = inject(ElementRef);

  ngAfterViewInit(): void {
    this.quill = new Quill(this.elementRef.nativeElement.querySelector(`#${this.editorId}`), {
      theme: 'snow',
    });

    if (this.content) {
      this.quill.clipboard.dangerouslyPasteHTML(this.content);
    }

    this.quill.on('text-change', () => {
      const htmlContent = this.quill.root.innerHTML;
      this.contentChange.emit(htmlContent);
    });

  }

  updateContent(newContent: string) {
    if (this.quill) {
      this.quill.clipboard?.dangerouslyPasteHTML(newContent);
    }
  }
}
