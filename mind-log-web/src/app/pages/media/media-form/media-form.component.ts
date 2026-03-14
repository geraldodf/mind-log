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
import { DatePickerInputComponent } from '../../../components/date-picker-input/date-picker-input.component';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';

@Component({
  selector: 'app-media-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EmojiPickerComponent, DatePickerInputComponent, TranslatePipe, SystemNamePipe],
  templateUrl: './media-form.component.html',
})
export class MediaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userMediaService = inject(UserMediaService);
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
      visibility: ['PRIVATE'],
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
        this.toastr.error('Failed to load entry.');
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
        this.toastr.success(this.isEdit ? 'Entry updated!' : 'Entry created!');
        this.router.navigate(['/media', result.id]);
      },
      error: () => {
        this.toastr.error('Failed to save entry.');
        this.submitting = false;
      }
    });
  }

  get f() { return this.form.controls; }
  stars = [1, 2, 3, 4, 5];

  recommendationOptions = [
    { value: 'RECOMMEND', labelKey: 'media.recommend', icon: 'fa-thumbs-up', cls: 'text-emerald-500' },
    { value: 'NEUTRAL', labelKey: 'media.neutral', icon: 'fa-minus', cls: 'text-slate-400' },
    { value: 'NOT_RECOMMEND', labelKey: 'media.notRecommend', icon: 'fa-thumbs-down', cls: 'text-red-400' },
  ];

  visibilityOptions = [
    { value: 'PRIVATE', labelKey: 'media.private', icon: 'fa-lock' },
    { value: 'PUBLIC', labelKey: 'media.public', icon: 'fa-globe' },
  ];
}
