import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";
import {FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {TwoAuthPinValidator} from "Validators";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";

@Component({
    selector: 'pin-input',
    templateUrl: 'pin-input.component.html',
    styleUrls: ['pin-input.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PinInputComponent),
            multi: true
        }
    ]
})
export class PinInputComponent implements OnInit {
    @Input('value') set pin(value: string) {
        this.writeValue(value);
    }

    get pin(): string {
        return this.formGroup.controls['pin'] ? this.formGroup.controls['pin'].value : '';
    }

    @Input() description: string = '';
    @Input() placeholder: string;
    @Output() valueChange = new EventEmitter<string>();

    private timeInterval: any;
    formGroup: FormGroup;

    timeLeft = 30;

    get valid(): boolean {
        return this.formGroup && this.formGroup.valid;
    }

    constructor() {
        this.formGroup = new FormGroup({
            'pin': new FormControl('', [
                Validators.required,
                TwoAuthPinValidator()
            ])
        });
    }

    ngOnInit() {
        this.formGroup.controls['pin'].valueChanges
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((v: string) => {
                this.valueChange.emit(v);
            });

        this.timeLeft = Math.round(30 - (Date.now() / 1000) % 30);
        this.timeInterval = setInterval(() => {
            this.timeLeft = Math.round(30 - (Date.now() / 1000) % 30);
            if (this.timeLeft <= 0) {
                this.writeValue("");
            }
        }, 1000);
    }

    change(v: string) {
        this.onChange(v);
    }

    writeValue(value: string): void {
        this.formGroup.controls['pin'].setValue(value);
        this.onChange(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
    }

    onChange: (value: string) => void = (value: string) => {
    }
    onTouched = () => {
    }

    ngOnDestroy() {
        clearInterval(this.timeInterval);
    }
}


