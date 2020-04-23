import {AlertBase, EAlertState} from "./AlertBase";

export abstract class  FEAlertBase extends AlertBase {
    protected _valueChangedCallback: () => void;

    constructor() {
        super();
        this._valueChangedCallback = () => {
            if (this.isStarted) {
                this._valueChanged();
            }
        };
    }

    public start() {
        this._dataSource.subscribeToSourceChanged(this._valueChangedCallback);
        this._state = EAlertState.Started;
    }

    public stop() {
        this._dataSource.unsubscribeFromSourceChanged(this._valueChangedCallback);
        this._state = EAlertState.Stopped;
    }

    public setFEExecution() {
        this._onCloud = false;
    }

    protected abstract _valueChanged();
}