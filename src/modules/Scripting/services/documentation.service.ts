import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {Documentation} from "@scripting/components/documentation/documentation.component";
import {
    documentationsIndicator,
    documentationsMath, documentationsScriptingOrder, generalMethods, multiDataMethods
} from "@scripting/models/documentations";
import {
    IGetDocumentationsParams,
    IGetDocumentationsResult, IInfoGeneral, IInfoMultiData,
    IMethodDocumentation
} from "@scripting/models/interfacesDocumentation";
import {
    DocumentationIndicatorOperator,
    DocumentationMathOperator,
    DocumentationOrderTradingOperator
} from "@scripting/models/method-documentations";

const trading = documentationsScriptingOrder.map((order): IMethodDocumentation => new DocumentationOrderTradingOperator(order));

const math = documentationsMath.map((mathObj): IMethodDocumentation => new DocumentationMathOperator(mathObj));

const indicators = documentationsIndicator.map((indicator): IMethodDocumentation => new DocumentationIndicatorOperator(indicator));

const general: IInfoGeneral[] = generalMethods;

const multiData: IInfoMultiData[] = multiDataMethods;

@Injectable()
export class DocumentationService {
    constructor() {}

    getDocumentations(params: IGetDocumentationsParams): Observable<IGetDocumentationsResult> {
        const filter = (documentation: Documentation, _params: IGetDocumentationsParams): boolean => {
            if (_params.query == null) {
                return documentation.category === _params.category;
            }

            return documentation.name.toLowerCase().indexOf(_params.query.toLowerCase()) !== -1
                && documentation.category === _params.category;
        };
        return of({
            properties: math.filter((item) => filter(item, params)),
            methods: indicators.filter((item) => filter(item, params)),
            trading: trading.filter((item) =>  filter(item, params)),
            general: general.filter((item) => filter(item, params)),
            multiData: multiData.filter((item) => filter(item, params)),
        });
    }
}
