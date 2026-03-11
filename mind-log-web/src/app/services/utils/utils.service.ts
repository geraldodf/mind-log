import { Injectable } from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  getFilterAndPageParams<T>(filterParams: T, pageSize: number, pageNumber: number, sort: string): HttpParams {
    let params = new HttpParams();

    if (filterParams) {
      Object.keys(filterParams).forEach(key => {
        const value = filterParams[key as keyof T];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    params = params.set("sort", sort);
    params = params.set("page", pageNumber);
    params = params.set("size", pageSize);
    return params;
  }

  getHttpParams<T>(params: T): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof T];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return httpParams;
  }

  getEmptyTableRows<T>(data: T[] | null, pageSize: number): number[] {
    return data == null ? []
      : Array(pageSize - data.length);
  }

  convertNgbDateStructToDate(date: any): Date {
    if (date && typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
      return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    }
    return new Date();
  }

  nextContactDate(): NgbDateStruct {
    const currentDate = new Date();
    let daysToAdd = 6; //must add the number of days until next contact + 1
    let nextContactDate = new Date(currentDate);

    while (daysToAdd > 0) {
      nextContactDate.setDate(nextContactDate.getDate() + 1);
      if (nextContactDate.getDay() < 6) {
        daysToAdd--;
      }
    }

    return {
      year: nextContactDate.getUTCFullYear(),
      month: nextContactDate.getUTCMonth() + 1,
      day: nextContactDate.getUTCDate(),
    } as NgbDateStruct;
  }

  convertDateToNgbDateStruct(date: Date): NgbDateStruct {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    } as NgbDateStruct;
  }

  ngbDateNow(): NgbDateStruct {
    const date = new Date();
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getDate(),
    } as NgbDateStruct;
  }

  equalsTo(otherField: string) {
    const validator = (formControl: FormControl) => {
      if (!otherField) throw new Error('É necessário informar um campo.');

      if (!formControl.root || !(<FormGroup>formControl.root).controls) {
        return null;
      }

      const field = (<FormGroup>formControl.root).controls[otherField]

      if (!field) throw new Error('É necessário informar um campo válido.');

      if (field.value !== formControl.value) {
        return { equalsTo: true };
      }

      return null

    };

    return validator;
  }

  formatDocument(document: string): string {
    if (document.length === 11) {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (document.length === 14) {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return document;
  }

}
