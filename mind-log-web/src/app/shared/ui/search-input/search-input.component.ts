import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements OnInit, OnDestroy {
  private static nextId = 0;

  /** Vazio cai no placeholder traduzido padrão. */
  @Input() placeholder = '';
  @Input() ariaLabel = '';
  @Input() id = `app-search-${SearchInputComponent.nextId++}`;
  @Output() searchChange = new EventEmitter<string>();

  control = new FormControl('');
  private destroy$ = new Subject<void>();

  get inputId(): string {
    return this.id;
  }

  ngOnInit(): void {
    this.control.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchChange.emit(value ?? '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clear(): void {
    this.control.setValue('');
  }
}
