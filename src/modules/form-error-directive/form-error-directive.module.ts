import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormErrorDirective} from './directives/form-error.directive';

@NgModule({
    declarations: [FormErrorDirective],
    imports: [
        CommonModule
    ],
    exports: [
        FormErrorDirective
    ]
})
export class FormErrorDirectiveModule {
}
