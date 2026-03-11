import { Injectable } from '@angular/core';
import {NgbDateParserFormatter, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: 'root'
})
export class CustomDateParserFormatterService extends NgbDateParserFormatter {

  format(date: NgbDateStruct | null): string {
    if (!date) {
      return '';
    }
    const day = date.day < 10 ? `0${date.day}` : date.day;
    const month = date.month < 10 ? `0${date.month}` : date.month;
    return `${day}/${month}/${date.year}`;
  }

  parse(value: string): NgbDateStruct | null {
    if (!value) {
      return null;
    }
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return { day, month, year };
      }
    }
    return null;
  }
}
