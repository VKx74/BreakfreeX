import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";

export interface FormGroupComponent {
    formInvalid: () => boolean;
    getFormData: () => CompanyInformation;
}

export interface CompanyInformation {
    email: string;
    companyName: string;
    firstName: string;
    lastName: string;
    phone: string;
    roleAtCompany: string;
    country: string;
    city: string;
    address: string;
    companyNumber: string;
    director1Name: string;
    director1LastName: string;
    director2Name?: string;
    director2LastName?: string;
    employersCount: string;
    website?: string;
}

@Component({
    selector: 'company-info',
    templateUrl: './company-info.component.html',
    styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements FormGroupComponent {
    formGroup: FormGroup;
    countriesList: string[] = [];
    employersCountList: string[];
    errorNotification: string;

    constructor(private _personalInfoService: PersonalInfoService) {
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();
        this._getCountriesList();
        this._getEmployersCountsList();
    }

    formInvalid(): boolean {
        return this.formGroup.invalid;
    }

    getFormData(): CompanyInformation {
        const controls = this.formGroup.controls;
        return {
            email: controls['email'].value,
            companyName: controls['companyName'].value,
            firstName: controls['firstName'].value,
            lastName: controls['lastName'].value,
            phone: controls['phone'].value,
            roleAtCompany: controls['roleAtCompany'].value,
            country: controls['country'].value,
            city: controls['city'].value,
            address: controls['address'].value,
            companyNumber: controls['companyNumber'].value,
            employersCount: controls['employersCount'].value,
            director1Name: controls['director1Name'].value,
            director1LastName: controls['director1LastName'].value,
            director2Name: controls['director2Name'].value || null,
            director2LastName: controls['director2LastName'].value || null,
            website: controls['website'].value || ''
        };
    }

    private _getFormGroup() {
        return new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            companyName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            phone: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]),
            roleAtCompany: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
            country: new FormControl('', [Validators.required]),
            city: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
            address: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
            companyNumber: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
            director1Name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            director1LastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            director2Name: new FormControl('', [Validators.minLength(2), Validators.maxLength(50)]),
            director2LastName: new FormControl('', [Validators.minLength(2), Validators.maxLength(50)]),
            employersCount: new FormControl('', [Validators.required]),
            website: new FormControl(''),
        });
    }

    private _getCountriesList() {
        this.errorNotification = null;
        this._personalInfoService.getSupportedCountriesList()
            .subscribe((countries: string[]) => {
                this.countriesList = countries;
                this.formGroup.controls['country'].setValue(this.countriesList[0]);
            }, (error) => {
                this.errorNotification = 'Failed to load list of countries';
                console.log(error);
            });
    }

    private _getEmployersCountsList() {
        this._personalInfoService.getEmployersCountList()
            .subscribe(counts => {
                this.employersCountList = counts;
                this.formGroup.controls['employersCount'].setValue(this.employersCountList[0]);
            }, e => {
                this.errorNotification = 'Failed to load list of employers counts';
                console.log(e);
            });
    }

}
