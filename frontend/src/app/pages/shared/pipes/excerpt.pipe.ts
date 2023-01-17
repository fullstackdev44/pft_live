import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'excerpt'
})
export class ExcerptPipe implements PipeTransform {

  transform(value: string, length: number): string {

    if(!value){
      return "";
    }
    
    if(value.length > length){
      return value.substring(0, length) + "...";
    }

    return value;
  }

}
