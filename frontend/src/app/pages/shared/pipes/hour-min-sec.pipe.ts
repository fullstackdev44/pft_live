import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'hrminsec'
})
export class HourMinSecPipe implements PipeTransform {
  transform(value: number, args?: any): any {
    if (isNaN(value) || value === null ) return null;

    const seconds = Math.floor((value % 60));
    const minutes = Math.floor(((value / 60) % 60));
    const hours   = Math.floor(((value / 60) / 60));

    let hrs  = (hours < 10) ? '0' + hours : hours;
    let mins = (minutes < 10) ? '0' + minutes : minutes;
    let secs = (seconds < 10) ? '0' + seconds : seconds;

    return (hours > 0) ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
  }
}
