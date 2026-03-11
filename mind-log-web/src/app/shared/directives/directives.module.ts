import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasHoleDirective } from './has-role.directive';

@NgModule({
    declarations: [HasHoleDirective],  
    imports: [CommonModule],
    exports: [HasHoleDirective]  
  })
export class DirectivesModule { }