import {DocumentationCategory} from "@scripting/models/documentations";

export interface IMethodDocumentation {
    category: DocumentationCategory;
    name: string;
    signature: string;
    parameters: IParamsInfo[];
    description: string;
    output: string;
    examples: string[][];
}

export interface IScriptIndicatorsDocumentation {
    name: string;
    description: string;
    output: string[];
    nameParams: string[];
}

export interface IParamsInfo {
    name?: string;
    type: string;
    example: string;
    description: string;
    required?: boolean;
}

export interface IScriptingCoverInfo {
    name: string;
    description: string;
    nameParams: string[];
    examples: string[];
}

export interface IScriptingOrderInfo {
    name: string;
    description: string;
    nameParams: string[];
}

export interface IInfoGeneral {
    category: DocumentationCategory;
    name: string;
    signature: string;
    parameters: IGeneralParams[];
    description: string;
    examples: string[];
}

export interface IGeneralParams {
    example: string;
    name: string;
    type: string;
    description: string;
}

export interface IInfoMultiData {
    name: string;
    signature: string;
    category: DocumentationCategory;
    description: string;
    parameters: IInfoMultiDataParams[];
    examples: string[];
}

export interface IGetDocumentationsParams {
    query: string;
    category: DocumentationCategory;
}

export interface IGetDocumentationsResult {
    properties: IMethodDocumentation[];
    methods: IMethodDocumentation[];
    trading: (IMethodDocumentation | ITradingPositionAndGeneral)[];
    general: IInfoGeneral[];
    multiData: IInfoMultiData[];
}

export interface IGenerateMath {
    name: string;
    description: string;
    parameters: IParamsInfo[];
    quantityOverloads: number;
    numberCount: number;
}

export interface ITradingPositionAndGeneral {
    category: DocumentationCategory;
    name: string;
    signature: string;
    description: string;
    examples: string[];
    parameters: IParamsPosition[] | IGeneralParams[];
}

interface IParamsPosition {
    name: string;
    type: string;
    description: string;
    example: string;
}

interface IInfoMultiDataParams {
    type: string;
    name: string;
    description: string;
}
