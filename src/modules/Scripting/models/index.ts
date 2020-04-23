import {COMPILE_STATUS} from "@scripting/models/enums";

export interface CompilationStatus {
    status: COMPILE_STATUS;
    problems?: any[];
}
