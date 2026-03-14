import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { en } from '../i18n/en';
import { pt } from '../i18n/pt';

export type Lang = 'en' | 'pt';

const TRANSLATIONS: Record<Lang, Record<string, string>> = { en, pt };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLang = new BehaviorSubject<Lang>(this.getSaved());

  lang$ = this.currentLang.asObservable();

  get current(): Lang { return this.currentLang.value; }

  t(key: string): string {
    return TRANSLATIONS[this.current][key] ?? key;
  }

  translateName(name: string): string {
    return TRANSLATIONS[this.current][`sys.${name}`] ?? name;
  }

  setLang(lang: Lang): void {
    this.currentLang.next(lang);
    localStorage.setItem('lang', lang);
  }

  toggle(): void {
    this.setLang(this.current === 'en' ? 'pt' : 'en');
  }

  private getSaved(): Lang {
    const saved = localStorage.getItem('lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'en';
  }
}
