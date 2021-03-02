import {Component} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {AdminTranslateService} from "../../localization/token";
import {Roles, UserModel} from "@app/models/auth/auth.models";
import {UsersService} from "@app/services/users.service";
import {Observable, of} from "rxjs";
import {ConfirmModalComponent, SearchHandler} from "UI";
import {AppMemberModel, AppMemberModelFactory} from "./app-member";
import {MatDialog} from "@angular/material/dialog";
import {
    AppMemberConfiguratorComponent,
    ConfiguratorConfig
} from "../app-member-configurator/app-member-configurator.component";
import {ActivatedRoute, Router} from "@angular/router";
import {PersonalInfoHelper} from "@app/services/personal-info/personal-info-helper.service";
import {
    KycHistoryModel,
    PersonalInfoService,
    PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import {MatSelectChange} from "@angular/material/select";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {AlertService} from "@alert/services/alert.service";
import {AppMembersVM, PersonalInfoStatusFilter} from "./vm";
import {JsUtil} from "../../../../utils/jsUtil";
import {AppMemberInfoComponent, AppMemberInfoComponentConfig} from "../app-member-info/app-member-info.component";
import {TagsManagerComponent} from "../tags-manager/tags-manager.component";
import {IdentityService} from "@app/services/auth/identity.service";
import {AppMemberKycHistoryComponent} from "../app-member-kyc-history/app-member-kyc-history.component";
import {RefreshPasswordComponent} from "../refresh-password/refresh-password.component";
import {RolesHelper} from "@app/helpers/role.helper";
import {ComponentIdentifier} from "@app/models/app-config";
import {SystemNotification} from "../../../Notifications/models/models";
import { LayoutStorageService } from '@app/services/layout-storage.service';


@Component({
    selector: 'app-members',
    templateUrl: 'app-members.component.html',
    styleUrls: ['app-members.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AdminTranslateService
        },
        AppMemberModelFactory,
        AppMembersVM,
        RolesHelper
    ]
})
export class AppMembersComponent {
    searchHandler: SearchHandler;
    personalInfoStatusFilters: PersonalInfoStatusFilter[] = JsUtil.numericEnumToArray(PersonalInfoStatusFilter);
    Roles = Roles;
    ComponentIdentifier = ComponentIdentifier;

    get viewModel(): AppMembersVM {
        return this.vm;
    }
    
    get members(): AppMemberModel[] {
        return this.vm.items;
    }

    set members(items: AppMemberModel[]) {
        this.vm.items = items;
    }

    get processing(): boolean {
        return this.vm.processing;
    }

    get activeFilter(): PersonalInfoStatusFilter {
        return this.vm.activeFilter;
    }

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _usersService: UsersService,
                private _dialog: MatDialog,
                private _personalInfoHelper: PersonalInfoHelper,
                private _authService: AuthenticationService,
                private _identityService: IdentityService,
                private _alertService: AlertService,
                private _rolesHelper: RolesHelper,
                private _personalInfoService: PersonalInfoService,
                private _layoutStorageService: LayoutStorageService,
                public vm: AppMembersVM) {
    }

    ngOnInit() {
        this.searchHandler = {
            onSearch: (query: string) => {
                return this.handleSearch(query);
            },
            onSearchCompleted: (result: UserModel[]) => {
            },
            onSearchError: (error: any, query: string) => {
            }
        };
    }

    handleStatusFilterChange(change: MatSelectChange) {
        this.vm.changeFilter(change.value);
    }

    handleSearch(query: string): Observable<UserModel[]> {
        this.vm.search(query);
        return of(null);
    }

    toggleMemberActiveStatus(member: AppMemberModel) {
        const isActive = member.isActive;
        const obs = isActive
            ? member.deactivate()
            : member.activate();

        obs.subscribe(() => {
        }, (e) => {
            console.error(e);
        });
    }

    getFilterStr(statusFilter: PersonalInfoStatusFilter): Observable<string> {
        switch (statusFilter) {
            case PersonalInfoStatusFilter.All:
                return of('All');
            case PersonalInfoStatusFilter.Approve:
                return of('Approved');
            case PersonalInfoStatusFilter.Rejected:
                return of('Rejected');
            case PersonalInfoStatusFilter.Pending:
                return of('Pending');
            case PersonalInfoStatusFilter.None:
            default:
                return of('None');
        }
    }

    getPersonalInfoStatus(status: PersonalInfoStatus): Observable<string> {
        return this._personalInfoHelper.getPersonalInfoStatusStr(status);
    }
    
    getSubscriptions(model: UserModel): string {
        if (!model.subscriptions || !model.subscriptions.length) {
            return "No Subscription";
        }

        if (model.subscriptions.length === 1) {
            return model.subscriptions[0].name;
        }

        return `${model.subscriptions[0].name} (+${model.subscriptions.length - 1})`;
    }

    registerMember() {
        this._dialog.open(AppMemberConfiguratorComponent, {
            data: {
                isEditMode: false,
                user: new UserModel()
            } as ConfiguratorConfig
        } as any)
            .afterClosed()
            .subscribe();
    }

    updateMember(member: AppMemberModel) {
        this._dialog.open(AppMemberConfiguratorComponent, {
            data: {
                isEditMode: true,
                user: member.user,
                isCurrentUser: member.isCurrentUser
            } as ConfiguratorConfig
        } as any)
            .afterClosed()
            .subscribe({
                next: (user: UserModel) => {
                    if (user) {
                        member.updateUser(user);
                    }
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }

    handleUserDelete(memberToRemove: AppMemberModel) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Delete member',
                message: `Are you sure you want to delete ${memberToRemove.user.email} user?`,
                onConfirm: () => {
                    this.vm.deleteUser(memberToRemove)
                        .subscribe({
                            next: () => {
                                this._alertService.success('User deleted');
                            },
                            error: (e) => {
                                console.error('failed to delete user', e);
                                this._alertService.error('Failed to delete user');
                            }
                        });
                }
            }
        });
    }

    showToggleMenu(member: AppMemberModel): boolean {
        const role = this._identityService.role;
        if (role === Roles.Admin || role === Roles.SupportOfficer) {
            return true;
        }
        return this._isKycStatusSet(member);
    }

    disable2FA(member: AppMemberModel) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Disable 2 factor authentication',
                message: `Are you sure you want to disable 2 factor authentication for ${member.user.email} user?`,
                onConfirm: () => {
                    this.vm.processing = true;
                    this._usersService.disable2FactorAuth(member.user.email)
                        .subscribe((data) => {
                            this.vm.processing = false;
                            member.user.twoFactorEnabled = !data;
                            this._alertService.success('2 factor authentication disabled');
                        }, e => {
                            this.vm.processing = false;
                            this._alertService.error('Failed to disable 2 factor authentication');
                            console.log(e);
                        });
                }
            }
        });
    }

    refreshPassword(member: AppMemberModel) {
        this._dialog.open(RefreshPasswordComponent, {
            data: {
                isEmailRefreshing: false,
                user: member.user
            }
        })
            .afterClosed()
            .subscribe(() => {

            }, e => {
                console.log(e);
            });
    }

    refreshEmail(member: AppMemberModel) {
        this._dialog.open(RefreshPasswordComponent, {
            data: {
                isEmailRefreshing: true,
                user: member.user
            }
        })
            .afterClosed()
            .subscribe((user: UserModel) => {
                if (user) {
                    member.updateUser(user);
                }
            }, e => {
                console.log(e);
            });
    }

    showKycHistoryButton(member: AppMemberModel): boolean {
        return this._isKycStatusSet(member);
    }

    showDetailsBtn(member: AppMemberModel): boolean {
        return this._isKycStatusSet(member);
    }

    showUserInfo(member: AppMemberModel) {
        this._dialog.open<any, AppMemberInfoComponentConfig>(AppMemberInfoComponent, {
            data: {
                user: member.user,
                statusChangeHandler: (status: PersonalInfoStatus) => {
                    member.user.kycStatus = status;
                }
            }
        });
    }

    showKycHistory(member: AppMemberModel) {
        this._dialog.open(AppMemberKycHistoryComponent, {
            data: {
                loadHistory: this._personalInfoService.getUserKycHistory(member.user.email)
            }
        });
    }

    handleManageTags() {
        this._dialog.open(TagsManagerComponent)
            .afterClosed()
            .subscribe(() => {

            });
    }

    getPersonalInfoStatusClass(status: PersonalInfoStatus): string {
        const statusToClass = {
            [PersonalInfoStatus.Approve]: 'crypto-color-green',
            [PersonalInfoStatus.Pending]: 'crypto-color-yellow',
            [PersonalInfoStatus.Rejected]: 'crypto-color-red',
            [PersonalInfoStatus.None]: ''
        };

        return statusToClass[status];
    }

    roleToStr(role: string): Observable<string> {
        return this._rolesHelper.roleLocalizedStr(role as Roles);
    }

    clearUserSession(user: AppMemberModel) {
        const id = user.user.id;

        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Clear user session',
                message: `Are you sure you want to clear ${user.user.email} session?`,
                onConfirm: () => {
                    this._layoutStorageService.removeUserLayoutState(id)
                        .subscribe({
                            next: () => {
                                this._alertService.success('User session cleared');
                            },
                            error: (e) => {
                                console.error(e);
                                this._alertService.error('Failed to clear user session');
                            }
                        });
                }
            }
        });
    }  
    
    confirmUserEmail(user: AppMemberModel) {
        const id = user.user.id;

        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Approve user email',
                message: `Are you sure you want to approve user email '${user.user.email}'?`,
                onConfirm: () => {
                    this.vm.processing = true;
                    this._usersService.confirmUserEmail(id)
                        .subscribe({
                            next: () => {
                                this.vm.processing = false;
                                user.user.emailConfirmed = true;
                                this._alertService.success('User email approved');
                            },
                            error: (e) => {
                                this.vm.processing = false;
                                console.error(e);
                                this._alertService.error('Failed to approved user email');
                            }
                        });
                }
            }
        });
    }

    private _isKycStatusSet(member: AppMemberModel): boolean {
        return member.user.kycStatus !== PersonalInfoStatus.None;
    }
}
