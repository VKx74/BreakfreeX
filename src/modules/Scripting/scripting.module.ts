import {Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScriptEditorComponent} from './components/script-editor/script-editor.component';
import {IDEModule} from "../ide/ide.module";
import {FintaScriptService} from "./services/finta-script.service";
import {RunAutotradingComponent} from './components/run-autotrading/run-autotrading.component';
import {TradingModule} from "Trading";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {ScriptsTranslateService} from "./localization/token";
import {MatExpansionModule} from '@angular/material/expansion';
import {UIModule} from "UI";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ScriptCloudRepositoryService} from "./services/script-cloud-repository.service";
import {ScriptCloudExecutorService} from "./services/script-cloud-executor.service";
import {CompilationProblemsComponent} from './components/compilation-problems/compilation-problems.component';
import {SharedModule} from "Shared";
import {UsersScriptsModalComponent} from './components/users-scripts-modal/users-scripts-modal.component';
import {ScriptNameModalComponent} from './components/script-name-modal/script-name-modal.component';
import {StoreModule} from "@ngrx/store";
import {EffectsModule} from "@ngrx/effects";
import {ScriptingEffects} from "@scripting/store/effects/effects";
import {RunningScriptsComponent} from './components/running-scripts/running-scripts.component';
import {OnEnterDirectiveModule} from "@on-enter/on-enter-directive.module";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {reducer} from "./store/reducers";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ScriptParamsComponent} from './components/script-params/script-params.component';
import {DocumentationComponent} from './components/documentation/documentation.component';
import {DocumentationService} from "@scripting/services/documentation.service";
import {SharedTranslateService} from "@app/localization/shared.token";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {ScriptingApiService} from "@scripting/services/scripting-api.service";
import {AngularSplitModule} from "angular-split";
import {ThemeService} from "@app/services/theme.service";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InstrumentSearchModule,
        LocalizationModule,
        MatFormFieldModule,
        MatInputModule,
        UIModule,
        SharedModule,
        OnEnterDirectiveModule,
        FormsModule,
        MatTabsModule,
        MatSelectModule,
        MatSlideToggleModule,
        FormErrorDirectiveModule
    ],
    declarations: [
        ScriptParamsComponent
    ],
    exports: [
        ScriptParamsComponent
    ],
    entryComponents: [],
    providers: [
        {
            provide: ScriptsTranslateService,
            useFactory: TranslateServiceFactory('scripts'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class ScriptParametersModule {
}

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    exports: [],
    entryComponents: [],
    providers: [
        ScriptingApiService,
        ScriptCloudRepositoryService,
        ScriptCloudExecutorService
    ]
})
export class ScriptingModuleForAdmin {
}


@NgModule({
    imports: [
        CommonModule,
        StoreModule.forFeature('scripting', reducer),
        EffectsModule.forFeature([ScriptingEffects]),

        ReactiveFormsModule,
        IDEModule,
        InstrumentSearchModule,
        TradingModule,
        LocalizationModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        UIModule,
        SharedModule,
        OnEnterDirectiveModule,
        FormsModule,
        MatTabsModule,
        MatSelectModule,
        MatSlideToggleModule,
        FormErrorDirectiveModule,
        EducationalTipsModule,
        ScriptParametersModule,
        AngularSplitModule.forChild(),
    ],
    declarations: [
        ScriptEditorComponent,
        RunAutotradingComponent,

        CompilationProblemsComponent,
        UsersScriptsModalComponent,
        ScriptNameModalComponent,
        RunningScriptsComponent,
        DocumentationComponent
    ],
    exports: [
        ScriptEditorComponent,
        RunningScriptsComponent,
        UsersScriptsModalComponent
    ],
    entryComponents: [
        ScriptEditorComponent,
        RunAutotradingComponent,
        UsersScriptsModalComponent,
        ScriptNameModalComponent
    ],
    providers: [
        ScriptingApiService,
        ScriptCloudExecutorService,
        ScriptCloudRepositoryService,
        FintaScriptService,
        DocumentationService,
        {
            provide: ScriptsTranslateService,
            useFactory: TranslateServiceFactory('scripts'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class ScriptingModule {
    static forAdmin(): ModuleWithProviders {
        return {
            ngModule: ScriptingModuleForAdmin
        };
    }
}

