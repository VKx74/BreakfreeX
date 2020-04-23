import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserTagsService} from "../../services/user-tags.service";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {UsersService} from "@app/services/users.service";
import {RolesService} from "@app/services/role/roles.service";
import {AlertService} from "@alert/services/alert.service";
import {RolesHelper} from "@app/helpers/role.helper";
import {Observable} from "rxjs";

export interface IForumCategoryConfiguratorConfig {
    name?: string;
    description?: string;
    submitHandler: (name: string, description: string, closeModal: () => void) => Observable<any>;
}

@Component({
    selector: 'forum-category-configurator',
    templateUrl: './forum-category-configurator.component.html',
    styleUrls: ['./forum-category-configurator.component.scss']
})
export class ForumCategoryConfiguratorComponent extends Modal<IForumCategoryConfiguratorConfig> {
    formGroup: FormGroup;
    processing: boolean = false;

    get isEditMode(): boolean {
        return this.data.name != null;
    }

    constructor(_injector: Injector,
                private _authService: AuthenticationService,
                private _usersService: UsersService,
                private _rolesService: RolesService,
                private _alertService: AlertService,
                private _userTagsService: UserTagsService) {
        super(_injector);
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();
    }

    submit() {
        this.processing = true;
        this.data.submitHandler(
            this.formGroup.controls['name'].value,
            this.formGroup.controls['description'].value,
            this.close.bind(this))
            .subscribe({
                next: () => {
                    this.processing = false;
                },
                error: () => {
                    this.processing = false;
                }
            });
    }

    private _getFormGroup() {
        if (this.isEditMode) {
            return new FormGroup({
                name: new FormControl(this.data.name, [Validators.required, Validators.maxLength(100)]),
                description: new FormControl(this.data.description, [Validators.required, Validators.maxLength(1000)])
            });
        } else {
            return new FormGroup({
                name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
                description: new FormControl('', [Validators.required, Validators.maxLength(1000)])
            });
        }
    }
}
