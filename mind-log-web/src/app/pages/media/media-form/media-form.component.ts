import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../../services/user-media.service';
import { MediaTypeService } from '../../../services/media-type.service';
import { StatusService } from '../../../services/status.service';
import { MediaType } from '../../../models/media/media-type.interface';
import { Status } from '../../../models/media/status.interface';
import { EmojiPickerComponent } from '../../../components/emoji-picker/emoji-picker.component';
import { DatePickerInputComponent } from '../../../shared/ui/date-picker-input/date-picker-input.component';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  FormInputComponent,
  FormTextareaComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  RecommendationChipComponent,
  SegmentedControlComponent,
  SegmentedOption,
  SelectComponent,
  SelectOption,
  SpinnerComponent,
  StatusChipComponent,
  ToggleComponent,
} from '../../../shared/ui';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-media-form',
  standalone: true,
  providers: [SystemNamePipe],
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, EmojiPickerComponent, DatePickerInputComponent, TranslatePipe,
    CardComponent, BtnComponent, PageHeaderComponent, RatingStarsComponent,
    SelectComponent, BadgeComponent, StatusChipComponent, RecommendationChipComponent,
    FormInputComponent, FormTextareaComponent, SegmentedControlComponent, ToggleComponent, SpinnerComponent,
  ],
  templateUrl: './media-form.component.html',
})
export class MediaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly userMediaService = inject(UserMediaService);
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly systemName = inject(SystemNamePipe);

  form!: FormGroup;
  mediaTypes: MediaType[] = [];
  statuses: Status[] = [];
  editId?: number;
  isEdit = false;
  loading = false;
  submitting = false;

  ngOnInit(): void {
    this.buildForm();
    this.loadOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = +id;
      this.isEdit = true;
      this.loadExisting(this.editId);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      mediaTypeId: [null, Validators.required],
      statusId: [null, Validators.required],
      rating: [null],
      feelings: [[]],
      recommendation: [null],
      startDate: [null],
      endDate: [null],
      nextReleaseDate: [null],
      notes: [null],
      review: [null],
      visibility: ['PUBLIC'],
      isFavorite: [false],
      topRank: [null],
    });
  }

  loadOptions(): void {
    this.mediaTypeService.getAll().subscribe(t => this.mediaTypes = t);
    this.statusService.getAll().subscribe(s => this.statuses = s);
  }

  loadExisting(id: number): void {
    this.loading = true;
    this.userMediaService.getById(id).subscribe({
      next: (media) => {
        this.form.patchValue({
          title: media.title,
          mediaTypeId: media.mediaType.id,
          statusId: media.status.id,
          rating: media.rating,
          feelings: media.feelings ?? [],
          recommendation: media.recommendation,
          startDate: media.startDate,
          endDate: media.endDate,
          nextReleaseDate: media.nextReleaseDate,
          notes: media.notes,
          review: media.review,
          visibility: media.visibility,
          isFavorite: media.isFavorite,
          topRank: media.topRank,
        });
        this.loading = false;
      },
      error: () => {
        this.toastr.error(this.i18n.t('toast.loadFailed'));
        this.router.navigate(['/media']);
      }
    });
  }

  setRating(stars: number): void {
    const current = this.form.get('rating')?.value;
    this.form.patchValue({ rating: current === stars ? null : stars });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const value = this.form.value;

    const obs = this.isEdit && this.editId
      ? this.userMediaService.update(this.editId, value)
      : this.userMediaService.create(value);

    obs.subscribe({
      next: (result) => {
        this.toastr.success(this.isEdit ? this.i18n.t('toast.entryUpdated') : this.i18n.t('toast.entryCreated'));
        this.router.navigate(['/media', result.id]);
      },
      error: () => {
        this.toastr.error(this.i18n.t('toast.saveFailed'));
        this.submitting = false;
      }
    });
  }

  get f() { return this.form.controls; }

  get mediaTypeOptions(): SelectOption[] {
    return this.mediaTypes.map(t => ({ value: t.id, label: this.systemName.transform(t.name) }));
  }

  get statusOptions(): SelectOption[] {
    return this.statuses.map(s => ({ value: s.id, label: this.systemName.transform(s.name) }));
  }

  get previewMediaTypeName(): string | null {
    const id = this.form?.get('mediaTypeId')?.value;
    const found = this.mediaTypes.find(t => t.id === id);
    return found ? this.systemName.transform(found.name) : null;
  }

  /** O chip de status resolve cor/ícone pelo nome cru (não traduzido). */
  get previewStatusName(): string | null {
    const id = this.form?.get('statusId')?.value;
    return this.statuses.find(s => s.id === id)?.name ?? null;
  }

  recommendationLabelKey(r: string | null): string {
    switch (r) {
      case 'RECOMMEND': return 'media.recommend';
      case 'NOT_RECOMMEND': return 'media.notRecommend';
      default: return 'media.neutral';
    }
  }

  recommendationOptions = [
    { value: 'RECOMMEND', labelKey: 'media.recommend', icon: 'fa-thumbs-up', cls: 'text-success-500' },
    { value: 'NEUTRAL', labelKey: 'media.neutral', icon: 'fa-minus', cls: 'text-ink-subtle' },
    { value: 'NOT_RECOMMEND', labelKey: 'media.notRecommend', icon: 'fa-thumbs-down', cls: 'text-danger-400' },
  ];

  // Getter, não propriedade: o rótulo precisa ser relido quando o idioma muda.
  get visibilityOptions(): SegmentedOption[] {
    return [
      { value: 'PRIVATE', label: this.i18n.t('media.private'), icon: 'fa-solid fa-lock' },
      { value: 'PUBLIC', label: this.i18n.t('media.public'), icon: 'fa-solid fa-globe' },
    ];
  }

  onFavoriteChange(isFavorite: boolean): void {
    if (!isFavorite) this.form.patchValue({ topRank: null });
  }
}
