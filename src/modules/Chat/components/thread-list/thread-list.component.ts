import {Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild} from '@angular/core';
import {ChatApiService} from "../../services/chat.api.service";
import {IThread} from "../../models/thread";
import {NotificationService} from "@app/services/notification.service";
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {combineLatest, Observable, of} from "rxjs";
import {IdentityService} from "@app/services/auth/identity.service";
import {MatDialog} from "@angular/material/dialog";
import {
    ThreadConfiguratorComponentConfig, ThreadConfiguratorComponent,
    ThreadConfiguratorComponentResult
} from "../thread-configurator/thread-configurator.component";
import {Roles} from "@app/models/auth/auth.models";
import {ComponentIdentifier} from "@app/models/app-config";
import {UsersProfileService} from "@app/services/users-profile.service";
import {IThreadDTO} from "../../models/api.models";
import {FacadeService} from "../../services/facade.service";
import {ChatMode} from "../../enums/chat-mode";
import {catchError, map, mapTo, takeUntil} from "rxjs/operators";
import {ISearchHandler, ManualSearchComponent} from "UI";
import {
    InfinityLoaderHandler,
    ScrollDirection
} from "../../../infinity-loader/components/infinity-loader/infinity-loader.component";
import {ofType} from "@ngrx/effects";
import {SendMessageRequest} from "../../store/actions";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {IMessage, IThreadVM} from "../../models/models";
import {ObservableUtils} from "../../../../utils/observable.utils";

@Component({
    selector: 'thread-list',
    templateUrl: './thread-list.component.html',
    styleUrls: ['./thread-list.component.scss']
})
export class ThreadListComponent {
    @Input() chatMode: ChatMode;
    @Output() onActiveThreadChanged: EventEmitter<IThread> = new EventEmitter<IThread>();
    @ViewChild('wrapper', {static: false}) threadsWrapper: ElementRef;
    @ViewChild('searchComponent', {static: false, read: ManualSearchComponent}) searchComponent: ManualSearchComponent;

    threads$: Observable<IThreadDTO[]>;
    selectedThreadId$: Observable<string>;
    searchHandler: ISearchHandler;


    ComponentIdentifier = ComponentIdentifier;
    infinityLoaderHandler: InfinityLoaderHandler;
    showSearch: boolean = false;

    get showCreateThreadBtn(): boolean {
        return this.chatMode === ChatMode.PublicThreads ? this._identityService.role === Roles.Admin : true;
    }

    get ScrollDirection() {
        return ScrollDirection;
    }

    constructor(private _threadService: ChatApiService,
                private _notificationService: NotificationService,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _identityService: IdentityService,
                private _usersProfileService: UsersProfileService,
                private _dialog: MatDialog,
                private _facadeService: FacadeService) {
    }

    ngOnInit() {
        const isSearchMode$ = this._facadeService.searchedThreads$.pipe(map((threads) => threads != null));

        this.threads$ = combineLatest(
            this._facadeService.threads$,
            this._facadeService.searchedThreads$
        ).pipe(
            map(([threads, searchedThreads]) => {
                if (searchedThreads) {
                    return searchedThreads;
                }

                return threads;
            })
        );

        this.selectedThreadId$ = this._facadeService.selectedThreadId$;

        this.searchHandler = {
            onSearch: (query: string) => {
                return this._facadeService.searchPublicThreads(query);
            }
        };

        this.infinityLoaderHandler = {
            handleScroll: () => {
                if (ObservableUtils.instant(isSearchMode$)) {
                    return of([]);
                }

                return this._facadeService.loadMoreThreads()
                    .pipe(
                        catchError((e) => {
                            console.error(e);
                            return of(true);
                        })
                    );
            }
        };

        this._facadeService.actions$.pipe(ofType(SendMessageRequest))
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._scrollThreadsToTop();
            });
    }

    toggleSearch() {
        this.showSearch = !this.showSearch;

        if (!this.showSearch) {
            this._facadeService.cancelThreadSearch();
        }

        setTimeout(() => {
            if (this.searchComponent) {
                this.searchComponent.focus();
            }
        });
    }

    selectThread(thread: IThreadDTO) {
        if (thread.id !== this._facadeService.getSelectedThreadId()) {
            this._facadeService.selectThread(thread.id);
        }
    }

    handleSearchInputEmpty() {
        this._facadeService.cancelThreadSearch();
    }

    private _scrollThreadsToTop() {
        this.threadsWrapper.nativeElement.scrollTop = 0;
    }

    public createThread() {
        this._dialog.open(ThreadConfiguratorComponent, {
            data: {
                submitHandler: (result: ThreadConfiguratorComponentResult) => {
                    return this._facadeService.createThread(result.name, result.description, result.photo)
                        .pipe(
                            mapTo(true),
                            catchError((e) => {
                                this._handleCreateThreadError(e);

                                return of(false);
                            })
                        );
                }
            } as ThreadConfiguratorComponentConfig
        }).afterClosed();
    }

    private _handleCreateThreadError(e) {
        console.error(e);
        this._alertService.error(this._translateService.get('failedToCreateThread'));
    }

    trackByFn(index, item: IThreadVM) {
        return item.id; // or item.id
    }

    ngOnDestroy() {

    }
}
