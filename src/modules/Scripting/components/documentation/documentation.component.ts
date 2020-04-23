import {Component, OnInit} from '@angular/core';
import {JsUtil} from "../../../../utils/jsUtil";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentationService} from "@scripting/services/documentation.service";
import {ProcessState, ProcessStateType} from "@app/helpers/ProcessState";
import {switchmap} from "@decorators/switchmap";
import {finalize, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {TranslateService} from "@ngx-translate/core";
import {ScriptsTranslateService} from "@scripting/localization/token";
import bind from "bind-decorator";
import {Observable} from "rxjs";
import {
    IGetDocumentationsResult,
    IInfoGeneral, IInfoMultiData,
    IMethodDocumentation, ITradingPositionAndGeneral
} from "@scripting/models/interfacesDocumentation";
import {DocumentationCategory} from "@scripting/models/documentations";

export type Documentation = IMethodDocumentation | IInfoGeneral | ITradingPositionAndGeneral | IInfoMultiData;

interface IDocumentations {
    math: IMethodDocumentation[];
    methods: IMethodDocumentation[];
    trading: (IMethodDocumentation | ITradingPositionAndGeneral)[];
    general: IInfoGeneral[];
    multiData: IInfoMultiData[];
}

@Component({
    selector: 'documentation',
    templateUrl: './documentation.component.html',
    styleUrls: ['./documentation.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class DocumentationComponent implements OnInit {
    DocumentationCategories = JsUtil.stringEnumToArray<DocumentationCategory>(DocumentationCategory);
    DocumentationCategory = DocumentationCategory;
    formGroup: FormGroup;
    searchDocumentationsState = new ProcessState(ProcessStateType.None);
    selectedDocumentation: Documentation;
    documentations: IDocumentations;

    constructor(private _documentationsService: DocumentationService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            search: new FormControl(''),
            category: new FormControl(this.DocumentationCategories[0])
        });

        this.formGroup.controls['category'].valueChanges
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this.formGroup.controls['search'].reset();
                this.search();
            });

        this.search();
    }

    @bind
    categoryOptionCaption(category: DocumentationCategory): Observable<string> {
        return this._translateService.get(`documentationCategories.${JsUtil.stringEnumNameByValue(DocumentationCategory, category)}`);
    }

    handleSearchEnterKey() {
        this.search();
    }

    selectDocumentation(documentation: Documentation) {
        this.selectedDocumentation = documentation;
    }

    @switchmap()
    search() {
        this.searchDocumentationsState.setPending();

        return this._documentationsService.getDocumentations({
            query: this.formGroup.controls['search'].value,
            category: this.formGroup.controls['category'].value
        })
            .pipe(
                finalize(() => {
                    this.searchDocumentationsState.setFailed();
                })
            )
            .subscribe(
                (result: IGetDocumentationsResult) => {
                    this.selectedDocumentation = null;
                    this.documentations = {
                        math: result.properties,
                        methods: result.methods,
                        trading: result.trading,
                        general: result.general,
                        multiData: result.multiData,
                    };
                },
                (e) => {
                    console.error(e);
                }
            );
    }

    copyExample(example: string) {
        JsUtil.copyStringToClipboard(example);
    }

    ngOnDestroy() {
    }
}
