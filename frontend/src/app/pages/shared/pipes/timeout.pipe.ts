import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeout'
})
export class TimeoutPipe implements PipeTransform {

  transform(value: number,): string {

    let left = value;
    const hours = Math.floor(left / 3600);
    left -= hours * 3600;
    const minutes = Math.floor(left / 60);
    left -= minutes * 60;
    const seconds = left;

    let s_hours = "" + hours;
    let s_minutes = "" + minutes;
    let s_seconds = "" + seconds;

    if(hours < 10){
      s_hours = "0" + hours;
    }

    if(minutes < 10){
      s_minutes = "0" + minutes;
    }

    if(seconds < 10){
      s_seconds = "0" + seconds;
    }

    return s_hours + ":" + s_minutes + ":" + s_seconds;
  }

}
