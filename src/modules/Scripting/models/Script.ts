import {JsUtil} from "../../../utils/jsUtil";

export enum ScriptKind {
    alert = "alert",
    strategy = "strategy",
    indicator = "indicator"
}

export enum ScriptOrigin {
    default = "alert",
    custom = "custom",
    builtIn = "builtIn"
}

export const CalculateProperty = 'Calculate';
export const StartBehaviorProperty = 'StartBehavior';

export enum ScriptBasedOn {
    TrendBased = "trendbased"
}

export interface ScriptProperty {
    name: string;
    type: string;
    description?: string;
    defaultValue: string;
}

export interface IScript {
    name: string;
    description: string;
    properties: ScriptProperty[];
    scriptOrigin: ScriptOrigin;
}

export interface IScriptCategory {
    name: string;
    scripts: IScript[];
}


export class Script implements IScript {
    name: string = JsUtil.generateGUID();
    code: string = Script.defaultCodeTemplate();
    description: string = '';
    scriptKind: ScriptKind = ScriptKind.strategy;
    scriptOrigin: ScriptOrigin = ScriptOrigin.custom;
    properties: ScriptProperty[];

    static createNew(): Script {
        return new Script();
    }

    static clone(script: Script): Script {
        return Object.assign({}, script);
    }

    static defaultCodeTemplate(): string {
        return [
            'using System.ComponentModel.DataAnnotations;',
            'using breakfree.FintaSharp.Scripting.Indicators;',
            'using breakfree.FintaSharp.Scripting.Properties;',
            'using breakfree.FintaSharp.Interfaces;',

            'namespace breakfree.FintaSharp.Scripting.Strategies',
            '{',
            '    public class CustomStrategy : Strategy',
            '    {',
            '        protected override void OnInitializeCallback()',
            '        {',
            '            if (State == State.SetDefaults)',
            '           {',
            '                Calculate = Calculate.OnBarClose; //OnEachTick OnPriceChange OnBarClose',
            '                StartBehavior = StartBehavior.ImmediatelySubmit; // ImmediatelySubmit WaitForBarUpdate',
            '            }',
            '            // enter your initialization code here',
            '        }',

            '        protected override void OnRealtimeCallback()',
            '        {',
            '            if (State == State.Historical)',
            '            {',
            '                return;',
            '            }',
            '            // enter your calculation logic here',
            '        }',
            '    }',
            '}'
        ].join('\n');
    }
}
