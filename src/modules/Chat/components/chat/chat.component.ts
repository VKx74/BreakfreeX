import {Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core';
import {LocalizationService} from "Localization";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {FacadeService} from "../../services/facade.service";
import {IThreadDTO} from "../../models/api.models";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";
import {IOutputData} from "angular-split";
import {JsUtil} from "../../../../utils/jsUtil";
import {ChatInstanceKeyToken} from "../../chat-instance-key.token";
import {ChatTranslateService} from "../../localization/token";

@Component({
    selector: 'base-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        },
        {
            provide: ChatInstanceKeyToken,
            useFactory: () => {
                return JsUtil.generateGUID();
            }
        },
        FacadeService,
    ]
})
export class ChatComponent implements OnInit, OnDestroy {
    activeThread$: Observable<IThreadDTO>;

    hiddenThreadList: boolean = false;
    $initObs: Observable<any>;
    selectedThread$: Observable<IThreadDTO>;
    splitSizes = ['*', 50];

    constructor(@Inject(ChatModeToken) public chatMode: ChatMode,
                protected _localizationService: LocalizationService,
                protected _translateService: TranslateService,
                private _facadeService: FacadeService,
                public injector: Injector
                ) {
    }

    ngOnInit() {
        this.activeThread$ = this._facadeService.selectedThread$;
        this.$initObs = this._facadeService.loadInitialData();
        this.selectedThread$ = this._facadeService.selectedThread$;
    }

    onDragEnd(data: IOutputData) {
        this.splitSizes = data.sizes;
    }

    ngOnDestroy(): void {
    }
}

