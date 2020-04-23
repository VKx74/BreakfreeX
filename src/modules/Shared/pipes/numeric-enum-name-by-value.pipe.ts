import {Pipe, PipeTransform} from '@angular/core';
import {JsUtil} from "../../../utils/jsUtil";

@Pipe({
    name: 'numericEnumNameByValue'
})
export class NumericEnumNameByValuePipe implements PipeTransform {

    transform(Enum: any, value: any): any {
        return JsUtil.numericEnumNameByValue<any>(Enum, value);
    }

}
