import {Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {catchError, debounceTime, distinctUntilChanged, Observable, of, switchMap, tap} from "rxjs";
import {AsyncPipe, CommonModule} from "@angular/common";
import {MatAutocomplete, MatAutocompleteModule, MatOption} from "@angular/material/autocomplete";

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatAutocomplete,
    MatAutocompleteModule,
    MatOption,
  ],
  templateUrl: './autocomplete-input.component.html',
  styleUrl: './autocomplete-input.component.scss'
})
export class AutocompleteInputComponent<T extends { id: number; name: string }> implements OnInit, OnDestroy {

  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  @Input() placeholder: string = 'Search';
  @Input() searchFn: (query: string) => Observable<T[]> = () => of([]);
  @Input() isInvalid: boolean = false;
  @Input() invalidMessage: string = '';
  @Output() optionSelected = new EventEmitter<T>();
  searchControl = new FormControl();
  filteredOptions$: Observable<T[]>;
  dropdownVisible = false;

  constructor() {}

  ngOnInit(): void {
    this.filteredOptions$ = this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        if (value) this.showDropdown();

        return this.searchFn(value)
      })
    );

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (!this.el.nativeElement.contains(event.target)) {
        this.hideDropdown();
      }
    });
  }

  ngOnDestroy() {
    this.renderer.listen('document', 'click', () => {});
  }

  selectOption(option: T): void {
    this.searchControl.setValue(option.name);
    this.optionSelected.emit(option);
    this.hideDropdown();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hideDropdown();
    }
  }

  showDropdown(): void {
    this.dropdownVisible = true;
  }

  hideDropdown(): void {
    this.dropdownVisible = false;
  }

}
