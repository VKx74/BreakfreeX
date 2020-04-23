import {Pipe, PipeTransform} from '@angular/core';
import {JsUtil} from "../../../utils/jsUtil";

@Pipe({
    name: 'stringEnumNameByValue'
})
export class StringEnumNameByValuePipe implements PipeTransform {

    transform(Enum: any, value: any): any {
        return JsUtil.stringEnumNameByValue(Enum, value);
    }

}
