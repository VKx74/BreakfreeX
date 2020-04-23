import {NgModule} from '@angular/core';
import {LocalStorageService} from "./services/local-storage.service";
import {DataStorage} from "./services/data-storage";

@NgModule({
    providers: [
        LocalStorageService,
        {
            provide: DataStorage,
            useExisting: LocalStorageService
        }
    ]
})
export class StorageModule {
}
