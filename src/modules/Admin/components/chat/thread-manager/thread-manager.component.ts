import {Component, OnInit} from '@angular/core';
import {EThreadType, IThread, IThreadBan} from "../../../../Chat/models/thread";
import {ChatApiService} from "../../../../Chat/services/chat.api.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent, SearchHandler} from "UI";
import {Observable, of} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {JsUtil} from "../../../../../utils/jsUtil";
import {MatSelectChange} from "@angular/material/select";
import {AlertService} from "@alert/services/alert.service";
import {PageEvent} from "@angular/material/paginator";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {IPaginationResponse, PaginationComponent} from "@app/models/pagination.model";
import {ThreadDetailsDialogComponent} from "../thread-details-dialog/thread-details-dialog.component";
import {ThreadManagerService} from "../thread-manager.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {
    ThreadConfiguratorComponent,
    ThreadConfiguratorComponentConfig,
    ThreadConfiguratorComponentResult
} from "../../../../Chat/components/thread-configurator/thread-configurator.component";
import {catchError, mapTo, tap} from "rxjs/operators";
import {FileStorageService} from "@app/services/file-storage.service";
import {IThreadDTO} from "../../../../Chat/models/api.models";

@Component({
    selector: 'thread-manager',
    templateUrl: './thread-manager.component.html',
    styleUrls: ['./thread-manager.component.scss'],
})
export class ThreadManagerComponent extends PaginationComponent<IThread> implements OnInit {
    public threads: IThread[] = [];
    public showPaginator: boolean = false;
    public adminBans: IThreadBan[] = [];
    // EThreadType.Private
    public treadTypeArray = ['all', EThreadType.Public, EThreadType.Group];
    public activeTreadType = 'all';
    public searchQuery: string = '';
    public searchHandler: SearchHandler;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _chatApiService: ChatApiService,
                private _identity: IdentityService,
                private _route: ActivatedRoute,
                private _dialog: MatDialog,
                private _threadManagerService: ThreadManagerService,
                private _alertService: AlertService,
                private _fileStorage: FileStorageService) {
        super();
    }

    public ngOnInit() {
        (this._route.snapshot.data['threadResults'] as Observable<IPaginationResponse<IThread>>)
            .subscribe(resp => {
                this.threads = resp.items;
                this.setPaginationHandler(resp);

            });

        this.searchHandler = {
            onSearch: (query: string) => {
                this.searchQuery = query;
                this.resetPagination();
                return of();
            },
        };
    }

    getItems(): Observable<IPaginationResponse<IThread>> {
        return this._chatApiService.getAdminPanelPublicThreads(this.paginationParams, this.getFiltrationParams());
    }

    responseHandler(response: [IPaginationResponse<IThread>, PageEvent]): void {
        this.threads = response[0].items;
    }

    onThreadSelect(thread: IThread) {
        this._threadManagerService.currentThread = thread;
    }

    threadHasAvatar(thread: IThread): boolean {
        return thread.pictureId && thread.pictureId !== FileStorageService.ChatThreadDefaultPhotoId;
    }

    public handleFilterChange(event: MatSelectChange) {
        this.activeTreadType = event.value;
        this.resetPagination();
    }

    public toggleThreadBlockStatus(thread: IThread, toggleElement: MatSlideToggle) {
        toggleElement.disabled = true;
        if (thread.isBlocked) {
            this._chatApiService.unblockThreadById(thread.id)
                .subscribe(resp => {
                    if (resp && resp.success) {
                        thread.isBlocked = !thread.isBlocked;
                        toggleElement.disabled = false;
                    }
                });
        } else {
            this._chatApiService.blockThreadById(thread.id)
                .subscribe(resp => {
                    if (resp && resp.success) {
                        thread.isBlocked = !thread.isBlocked;
                        toggleElement.disabled = false;
                    }
                });
        }
    }

    public toggleThreadEnableStatus(thread: IThread, toggleElement: MatSlideToggle) {
        toggleElement.disabled = true;
        if (thread.isDisabled) {
            this._chatApiService.enableThreadById(thread.id)
                .subscribe(resp => {
                    if (resp && resp.success) {
                        thread.isDisabled = !thread.isDisabled;
                        toggleElement.disabled = false;
                    }
                });
        } else {
            this._chatApiService.disableThreadById(thread.id)
                .subscribe(resp => {
                    if (resp && resp.success) {
                        thread.isDisabled = !thread.isDisabled;
                        toggleElement.disabled = false;
                    }
                });
        }
    }

    public deleteThread(thread: IThread) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: 'Do you want to remove this thread? You can restore this thread any time.'
            }
        } as any)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this._chatApiService.deleteThreadById(thread.id)
                        .subscribe((resp) => {
                            if (resp) {
                                thread.removed = true;
                            }
                        });
                }
            });
    }

    public restoreThread(thread: IThread) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: 'Do you want to restore this thread?'
            }
        } as any)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this._chatApiService.restoreThreadById(thread.id)
                        .subscribe((resp) => {
                            if (resp && resp.success) {
                                thread.removed = false;
                            }
                        });
                }
            });
    }

    openThreadDetailsDialog(thread: IThread) {
        this._dialog.open(ThreadDetailsDialogComponent, {
            data: thread
        });
    }

    public newThreadModal() {
        this._dialog.open(ThreadConfiguratorComponent, {
            data: {
                submitHandler: (result: ThreadConfiguratorComponentResult) => {
                    return this._chatApiService.createThread({
                        name: result.name,
                        description: result.description,
                        photo: result.photo,
                        threadType: EThreadType.Public
                    })
                        .pipe(
                            tap(() => {
                                this.resetPagination();
                            }),
                            mapTo(true),
                            catchError((e) => {
                                console.error(e);

                                if (e.error.error.code === 1002) {
                                    this._alertService.error(e.error.error.message);
                                }

                                return of(false);
                            })
                        );
                }
            } as ThreadConfiguratorComponentConfig
        });
    }

    public editThreadModal(thread: IThread) {
        this._dialog.open(ThreadConfiguratorComponent, {
            data: {
                name: thread.name,
                description: thread.description,
                photoUrl: thread.pictureId !== FileStorageService.ChatThreadDefaultPhotoId
                    ? this._fileStorage.getImageUrl(thread.pictureId)
                    : undefined,
                submitHandler: (value) => {
                    return this._chatApiService.updateThread(thread.id, {
                        name: value.name,
                        description: value.description,
                        photo: value.photo
                    })
                        .pipe(
                            tap((updateThread: IThreadDTO) => {
                                thread.name = updateThread.name;
                                thread.description = updateThread.description;
                                thread.pictureId = updateThread.pictureId;
                            }),
                            mapTo(true),
                            catchError((e) => {
                                console.log(e);
                                if (e.status === 403) {
                                    this._alertService.error('Thread with given name is already exists');
                                } else if (e.error.error.code === 1002) {
                                    this._alertService.error(e.error.error.message);
                                }

                                return of(false);
                            })
                        );
                }
            } as ThreadConfiguratorComponentConfig
        });
    }

    errorHandler(error: any): void {
        if (error && error.status === 403) {
            this._alertService.warning('You are not allowed to view this thread info');
        }
    }

    private getFiltrationParams() {
        return {
            search: this.searchQuery,
            threadType: this.activeTreadType !== 'all' ? this.activeTreadType : null,
        };
    }

}
