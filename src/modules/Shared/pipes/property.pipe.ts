import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'property'
})
export class PropertyPipe implements PipeTransform {
    transform(obj: Object, key: any): string {
        if (obj[key] === undefined) {
            console.error(`Missed property: ${key}`);
            return '';
        }

        return obj[key];
    }
}

// obj | property:''
