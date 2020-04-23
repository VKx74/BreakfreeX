import {EDataSourceType} from "./Enums";
import {AlertSourceSettings} from "./AlertSourceSettingsBase";

export abstract class AlertDataSourceBase {
    public lastValue: number = null;
    public previouseValue: number = null;
    public time: number = null;

    protected _subscribers: (() => void)[] = [];

    abstract get relatedSymbol(): string;

    abstract get relatedExchange(): string;

    abstract get dataSourceType(): EDataSourceType;

    public abstract subscribeToSourceChanged(subscription: () => void);

    public abstract unsubscribeFromSourceChanged(subscription: () => void);

    public abstract dispose();

    public abstract init(data: AlertSourceSettings);

    public abstract getSettings(): AlertSourceSettings;

    public abstract getDescription(): string;
}