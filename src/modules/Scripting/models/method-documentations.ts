import {
    IGenerateMath,
    IMethodDocumentation, IParamsInfo,
    IScriptIndicatorsDocumentation, IScriptingOrderInfo
} from "@scripting/models/interfacesDocumentation";
import {DocumentationCategory, paramsOrderInfo, ParamsTypesIndicator} from "@scripting/models/documentations";

type ParamsOverload = IGenerateMath | IScriptIndicatorsDocumentation | IScriptingOrderInfo;

export interface IBaseData {
    category: DocumentationCategory;
    name: string;
    signature: string;
    parameters: IParamsInfo[];
    description: string;
    output: string;
    examples: string[][];

    getNeededParameters(params: IParamsInfo[], nameParamMethod: string[]);

    generateOverloads(params: ParamsOverload, ...examples: string[]): string[][];

    init(paramsInfo: ParamsOverload): IMethodDocumentation;
}

export abstract class DocumentationOperator implements IBaseData {
    category: DocumentationCategory;
    description: string;
    examples: string[][];
    name: string;
    output: string;
    parameters: IParamsInfo[];
    signature: string;

    protected constructor() {}

    getNeededParameters(params: IParamsInfo[], nameParamMethod: string[]) {
        return params.filter(param => nameParamMethod.some(paramMethod => paramMethod === param.name));
    }

    generateOverloads(params: ParamsOverload, ...examples: string[]): string[][] {
        return examples.map(example => params['numberCount'] ? [`var ${params.name.toLowerCase()} = Math.${params.name}(${(example)})`] : [`var ${params.name.toLowerCase()} = ${params.name}(${(example)})`]);
    }

    abstract init(params: ParamsOverload);
}

export class DocumentationMathOperator extends DocumentationOperator {

    constructor(parameter: IGenerateMath) {
        super();
        this.init(parameter);
    }

    init(paramsInfo: IGenerateMath) {
        let mathParam: IParamsInfo[] = [];
        let example: string[] = [];

    paramsInfo.parameters.forEach(param => {
        mathParam.push(param);
        let strExample = '';
        for (let i = 0; i < paramsInfo.numberCount; i++) {
            strExample += param.example;
            strExample += i !== paramsInfo.numberCount - 1 ? ', ' : '';
        }
        example.push(strExample);
        paramsInfo.quantityOverloads < 2 ? example = [example.join(', ')] : example.join(', ');
    });

        this.category = DocumentationCategory.Math;
        this.name = paramsInfo.name;
        this.signature = `${paramsInfo.name}()`;
        this.output = mathParam.map(m => m.type).join(', ');
        this.description = paramsInfo.description;
        this.parameters = mathParam;
        this.examples = this.generateOverloads(paramsInfo, ...example);

    }

}

export class DocumentationIndicatorOperator extends DocumentationOperator {
    constructor(parameter: IScriptIndicatorsDocumentation) {
        super();
        this.init(parameter);
    }

    private generateParameters(paramsInfo: IScriptIndicatorsDocumentation) {
        const methodParams: IParamsInfo[] = this.getNeededParameters(ParamsTypesIndicator, paramsInfo.nameParams);

        return {
            methodParams: methodParams,
            firstExampleParams: methodParams.filter(params => params.required).map(params => params.example).join(', '),
            secondExampleParams: methodParams.map(params => params.example).slice(1).join(', '),
            thirdExampleParams: methodParams.map(params => params.example).join(', '),
        };
    }

    init(paramsInfo: IScriptIndicatorsDocumentation) {
        const parameters = this.generateParameters(paramsInfo);

            this.category = DocumentationCategory.Indicators;
            this.name = paramsInfo.name;
            this.output = `${paramsInfo.output.length} series. (${paramsInfo.output.join(', ')})`;
            this.description = paramsInfo.description;
            this.signature = `${paramsInfo.name}()`;
            this.parameters =  parameters.methodParams;
            this.examples = this.generateOverloads(paramsInfo, parameters.firstExampleParams, parameters.secondExampleParams, parameters.thirdExampleParams);
    }
}

export class DocumentationOrderTradingOperator extends DocumentationOperator {
    constructor(parameter: IScriptingOrderInfo) {
        super();
        this.init(parameter);
    }


    private generateParameters(paramsInfo: IScriptingOrderInfo) {
        const methodParams: IParamsInfo[] = this.getNeededParameters(paramsOrderInfo, paramsInfo.nameParams);

        return {
            methodParams: methodParams,
            firstExampleParams: methodParams.map(example => example.example),
            secondExampleParams: methodParams.map(example => example.example).slice(0, -1),
        };
    }

    init(paramsInfo: IScriptingOrderInfo) {

            const parameters = this.generateParameters(paramsInfo);

            this.category = DocumentationCategory.Trading;
            this.name = paramsInfo.name;
            this.output = 'Return an Order read-only object that represents order.\n';
            this.description = `Generates ${paramsInfo.description} order to exit a long position.`;
            this.signature = `${paramsInfo.name}()`;
            this.parameters = parameters.methodParams;
            this.examples = this.generateOverloads(paramsInfo, parameters.secondExampleParams.join(', '), parameters.firstExampleParams.join(', '));
    }
}
// no need convert now - not using
// class DocumentationCoverTradingOperator extends DocumentationOperator {
//
//     constructor(parameter: IScriptingCoverInfo) {
//         super();
//         this.init(parameter);
//     }
//     init(paramsInfo: IScriptingCoverInfo) {
//         const methodParams: IParamsInfo[] = this.getNeededParameters(paramsOrderInfo, paramsInfo.nameParams);
//
//             this.category = DocumentationCategory.Trading;
//             this.name = paramsInfo.name;
//             this.output = 'Order read-only object that represents order.\n';
//             this.description = `Generates ${paramsInfo.description} order to enter a long position.`;
//             this.signature = `${paramsInfo.name}()`;
//             this.parameters = methodParams;
//             this.examples = paramsInfo.examples;
//     }
//
// }


