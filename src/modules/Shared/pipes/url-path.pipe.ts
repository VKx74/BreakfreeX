import { Pipe, PipeTransform } from '@angular/core';
import {memoize} from "@decorators/memoize";

@Pipe({
  name: 'urlPath',
})
export class UrlPathPipe implements PipeTransform {
  @memoize()
  transform(value: string): string {
    return value ? value.replace(/(.+\.com\/)/, '') : '';
  }
}
