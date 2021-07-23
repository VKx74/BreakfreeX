import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {PlatformTranslateService} from "../../localization/token";
import { LayoutStorageService } from '@app/services/layout-storage.service';
import { Store } from "@ngrx/store";
import { AppState } from '@app/store/reducer';

interface ILayoutModel {
    id: string;
    name: string;
    description: string;
    lastSavedTime: number;
    currentlyOpened?: boolean;
}

@Component({
    selector: 'open-layout-modal',
    templateUrl: './open-layout.component.html',
    styleUrls: ['./open-layout.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class OpenLayoutModalComponent extends Modal<void> implements OnInit {

    public loading: boolean = false;

    public items: ILayoutModel[] = [];

    public get isItemsExists(): boolean {
        if (!this.items || !this.items.length) {
            return false;
        }
        return true;
    }
    
    constructor(private _translateService: TranslateService, private _store: Store<AppState>, private _layoutStorageService: LayoutStorageService, injector: Injector) {
        super(injector);
    }

    public ngOnInit() {
        this.loading = true;
        this._layoutStorageService.loadLayouts().subscribe((layouts) => {
            this.loading = false;
            for (const layout of layouts) {
                this.items.push({
                    description: layout.description,
                    id: layout.layoutId,
                    name: layout.name,
                    lastSavedTime: layout.savedTime
                });

                this.items = this.items.sort((a, b) => b.lastSavedTime - a.lastSavedTime);
            }
        });
    }

    public reject() {
        this.close();
    }

    public openLayout(item: ILayoutModel) {
        this.close(item.id);
    }

    public removeLayout(item: ILayoutModel, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.loading = true;
        this._layoutStorageService.deleteLayout(item.id).subscribe(() => {
            this.loading = false;
            const index = this.items.indexOf(item);

            if (index !== -1) {
                this.items.splice(index, 1);
            }
        });
    }
}
