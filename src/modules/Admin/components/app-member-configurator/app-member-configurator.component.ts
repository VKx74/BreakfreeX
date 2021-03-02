import {Component, Inject, Injector} from "@angular/core";
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {AdminTranslateService} from "../../localization/token";
import {Roles, UserModel, UserRole} from "../../../../app/models/auth/auth.models";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {passwordValidator} from "Validators";
import {RolesService} from "@app/services/role/roles.service";
import {UsersService} from "@app/services/users.service";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {UrlsManager} from "@app/Utils/UrlManager";
import {AlertService} from "@alert/services/alert.service";
import {catchError, finalize, flatMap, map, mapTo} from "rxjs/operators";
import {ISetUserTagsParams, IUserTag, UserTagsService} from "../../services/user-tags.service";
import {
    TagsInputAutocompleteHandler,
    TagsInputMode,
    TagsInputTagNameSelector
} from "@tagsInput/components/tags-input/tags-input.component";
import {Observable, of} from "rxjs";
import {AppTranslateService} from "@app/localization/token";
import {RolesHelper} from "@app/helpers/role.helper";


export interface ConfiguratorConfig {
    isEditMode?: boolean;
    user: UserModel;
    isCurrentUser?: boolean;
}

export type MemberConfiguratorModalResultType = UserModel | boolean;

@Component({
    selector: 'add-app-member',
    templateUrl: 'app-member-configurator.component.html',
    styleUrls: ['app-member-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AdminTranslateService
        },
        RolesHelper
    ]
})
export class AppMemberConfiguratorComponent extends Modal<ConfiguratorConfig, MemberConfiguratorModalResultType> {
    roles: Roles[] = [];
    Roles = Roles;
    formGroup: FormGroup;

    get TagsInputMode() {
        return TagsInputMode;
    }

    get isUserUpdating(): boolean {
        return this.data.isEditMode;
    }

    get isUserCreating(): boolean {
        return !this.data.isEditMode;
    }

    get user(): UserModel {
        return this.data.user;
    }

    private _tags: IUserTag[] = [];

    get tags(): IUserTag[] {
        return this._tags;
    }

    processing: boolean = false;

    constructor(_injector: Injector,
                private _authService: AuthenticationService,
                private _usersService: UsersService,
                private _rolesService: RolesService,
                private _alertService: AlertService,
                private _userTagsService: UserTagsService,
                private _rolesHelper: RolesHelper
    ) {
        super(_injector);
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();

        this._userTagsService.getTags()
            .subscribe({
                next: (tags: IUserTag[]) => {
                    this._tags = tags.filter(t => this.user.tags.indexOf(t.name) !== -1);
                },
                error: (e) => {
                    console.error(e);
                }
            });

        this._rolesService.getRoles()
            .subscribe((roles: UserRole[]) => {
                for (let role of roles) {
                    this.roles.push(role.name);
                }
            });
    }

    create() {
        this._registerUser();
    }

    update() {
        this._updateUser();
    }

    private _registerUser() {
        const controls = this.formGroup.controls;
        const email = controls['email'].value;

        this.processing = true;
        this._authService.registerUser({
            email: email,
            role: controls['role'].value as string,
            password: controls['password'].value,
            redirectUri: UrlsManager.registrationRedirectUrl(controls['email'].value)
        })
            .pipe(
                flatMap(() => {
                    const tags: IUserTag[] = this._tags;

                    return this._setUserTags({
                        userEmail: email,
                        tags: tags.map(t => t.id)
                    });
                }),
                finalize(() => this.processing = false)
            )
            .subscribe({
                next: () => {
                    this._alertService.success('User registered');
                    this.close(true as MemberConfiguratorModalResultType);
                },
                error: () => {
                    this._alertService.error('Failed to register user');
                }
            });
    }

    private _updateUser() {
        const controls = this.formGroup.controls;

        this.processing = true;
        this._usersService.updateUser({
            id: this.data.user.id,
            email: controls['email'].value,
            userName: controls['userName'].value,
            role: controls['role'].value as string,
            stripeId: controls['stripeId'].value as string
        })
            .pipe(
                flatMap((user: UserModel) => {
                    const tags: IUserTag[] = this._tags;

                    return this._setUserTags({
                        userEmail: user.email,
                        tags: tags.map(t => t.id)
                    })
                        .pipe(
                            map(() => {
                                user.tags = tags.map(t => t.name);
                                return user;
                            })
                        );
                }),
                finalize(() => this.processing = false)
            )
            .subscribe({
                next: (user: UserModel) => {
                    this._alertService.success('User updated');
                    this.close(user as MemberConfiguratorModalResultType);
                },
                error: () => {
                    this._alertService.error('Failed to update user');
                }
            });
    }

    private _setUserTags(params: ISetUserTagsParams): Observable<any> {
        return this._userTagsService.setUserTags(params);
    }

    removeTag(tag: IUserTag) {
        this._tags = this._tags.filter(t => t.id !== tag.id);
    }

    addTag(tag: IUserTag) {
        this._tags.push(tag);
    }

    tagsAutocompleteHandler: TagsInputAutocompleteHandler = (query: string) => {
        return this._userTagsService.searchTags(query)
            .pipe(
                catchError((e) => {
                    console.error(e);
                    return of([]);
                })
            );
    }

    tagNameSelector: TagsInputTagNameSelector = (tag: IUserTag) => {
        return tag.name;
    }

    roleToStr(role: Roles): Observable<string> {
        return this._rolesHelper.roleLocalizedStr(role);
    }

    private _getFormGroup() {
        if (this.isUserUpdating) {
            return new FormGroup({
                role: new FormControl(this.user.role),
                userName: new FormControl(this.user.userName, [Validators.required, Validators.minLength(1)]),
                email: new FormControl(this.user.email, [Validators.required, Validators.email]),
                stripeId: new FormControl(this.user.stripeId)
            });
        } else {
            return new FormGroup({
                role: new FormControl(this.user.role || Roles.User),
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', [Validators.required, passwordValidator()]),
                stripeId: new FormControl('')
            });
        }
    }
}
