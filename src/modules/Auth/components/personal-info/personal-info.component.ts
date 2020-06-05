import {Component, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {digitValidator} from "Validators";
import {PersonalInformationModel, PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {ResetableComponent} from "../../models/models";
import {Observable} from "rxjs";
import {TouchedControlErrorStateMatcher} from "@app/Utils/touchedControlErrorStateMatcher";

export type PersonalInfoComponentCompleteHandler = (data: PersonalInformationModel) => Observable<any>;

@Component({
    selector: 'personal-info-page',
    templateUrl: './personal-info.component.html',
    styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements ResetableComponent {
    @Input() completeHandler: PersonalInfoComponentCompleteHandler;
    errorMatcher = new TouchedControlErrorStateMatcher();
    errorNotification: string;
    processing: boolean;

    formGroup: FormGroup;
    countriesList: string[] = [];
    isFullName = true;

    @Input() set userFullName(fullName: string[]) {
        this.setFullName(fullName);
    }

    constructor(private _personalInfoService: PersonalInfoService) {

        this._personalInfoService.getSupportedCountriesList()
            .subscribe((countries: string[]) => {
                this.countriesList = countries;
                this.formGroup.controls['country'].setValue(this.countriesList[0]);
            }, (error) => {
                console.log(error);
            });

        this.formGroup = this._getFormGroup();
    }

    ngOnInit() {
    }

    sendInfo() {
        const controls = this.formGroup.controls;
        const info: PersonalInformationModel = {
            firstName: controls['firstName'].value,
            lastName: controls['lastName'].value,
            birthDay: this._convertLocalTimeToUTC(new Date(controls['birth'].value).getTime()) / 1000,
            country: controls['country'].value,
            address: controls['address'].value,
            city: controls['city'].value,
            // postcode: controls['postcode'].value,
            postcode: 0, // temp solution DB accept just digits
        };

        this.processing = true;
        this.completeHandler(info)
            .subscribe({
                next: () => {
                    this.processing = false;
                },
                error: (e: string) => {
                    this.processing = false;
                    this.errorNotification = e;
                }
            });
    }

    resetAll() {
        this.formGroup = this._getFormGroup();
        this.formGroup.controls['country'].setValue(this.countriesList[0]);
    }

    private _convertLocalTimeToUTC(time: number): number {
        const dif = new Date(time).getTimezoneOffset() * 60000;
        return time - dif;
    }

    private setFullName(fullName: string[]) {
        let firstName = '';
        let lastName = '';
        this.isFullName = false;

        if (fullName) {
            this.isFullName = true;
            firstName = fullName[0];
            lastName = fullName[1];
        }

        const controls = this.formGroup.controls;
        controls['firstName'].reset({value: firstName, disabled: firstName});
        controls['lastName'].reset({value: lastName, disabled: firstName});
    }

    private _getFormGroup() {
        return new FormGroup({
            firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            birth: new FormControl('', [Validators.required]),
            country: new FormControl('', Validators.required),
            address: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]),
            city: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]),
            postcode: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(9)])
        });
    }

}
