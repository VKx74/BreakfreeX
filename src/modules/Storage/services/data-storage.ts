export abstract class DataStorage {
    protected _canSave = true;

    get canSave(): boolean {
        return this._canSave;
    }

    enable() {
        this._canSave = true;
    }

    disable() {
        this._canSave = false;
    }

    abstract set(key: string, data: any): boolean;
    abstract get(key: string): any;
    abstract remove(key: string): boolean;
    abstract clear(): boolean;
}
