import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsisAfter'
})
export class EllipsisAfterPipe implements PipeTransform {

  transform(text: string | number, maxSize: number): any {
    text = text.toString();
    return text && text.length > maxSize ? `${text.substring(0, maxSize)}...` : text;
  }

}
