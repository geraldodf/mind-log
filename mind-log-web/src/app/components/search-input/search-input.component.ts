import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Output() searchChange = new EventEmitter<string>();

  control = new FormControl('');
  private destroy$ = new Subject<void>();

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
