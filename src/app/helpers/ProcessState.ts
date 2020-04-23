export enum ProcessStateType {
    None,
    Pending,
    Succeeded,
    Failed
}

export class ProcessState {
    private _state: ProcessStateType;

    set state(state: ProcessStateType) {
        this._state = state;
    }

    get state(): ProcessStateType {
        return this._state;
    }

    constructor(state?: ProcessStateType) {
        this._state = state;
    }

    isPending(): boolean {
        return this._state === ProcessStateType.Pending;
    }

    isFailed(): boolean {
        return this._state === ProcessStateType.Failed;
    }

    isSucceeded(): boolean {
        return this._state === ProcessStateType.Succeeded;
    }

    isNone(): boolean {
        return this._state === ProcessStateType.None;
    }

    setPending() {
        this._state = ProcessStateType.Pending;
    }

    setFailed() {
        this._state = ProcessStateType.Failed;
    }

    setSucceeded() {
        this._state = ProcessStateType.Succeeded;
    }
}
