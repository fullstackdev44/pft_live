import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { HourMinSecPipe } from './pipes/hour-min-sec.pipe';
import { DndDirective } from './directives/dnd.directive';
import { ExcerptPipe } from './pipes/excerpt.pipe';
import { TimeoutPipe } from './pipes/timeout.pipe';

@NgModule({
    declarations: [ ShortNumberPipe, DateAgoPipe, HourMinSecPipe, DndDirective, ExcerptPipe, TimeoutPipe ],
    imports: [ CommonModule ],
    exports: [ ShortNumberPipe, DateAgoPipe, HourMinSecPipe, DndDirective, ExcerptPipe, TimeoutPipe ]
})

export class SharedModule {}
