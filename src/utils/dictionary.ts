export interface IKeyValuePair<TKey, TValue> {
    key: TKey;
    value: TValue;
}

export interface IDictionary<TKey, TValue> {
    count: number;

    set(key: TKey, value: TValue): void;

    remove(key: TKey): boolean;

    containsKey(key: TKey): boolean;

    get(key: TKey): TValue;
}

// endregion

//noinspection JSUnusedLocalSymbols
/**
 * Represents dictionary with key and value.
 * @constructor StockChartX.Dictionary
 */
export class Dictionary<TKey extends string | number, TValue> implements IDictionary<TKey, TValue> {
    /**
     * @internal
     */
    private _dict: object;

    // region Properties

    /**
     * @internal
     */
    private _length: number;

    get count(): number {
        return this._length;
    }

    // endregion

    constructor(pairs?: IKeyValuePair<TKey, TValue> | IKeyValuePair<TKey, TValue>[]) {
        this._length = 0;
        this._dict = {};

        if (pairs) {
            if (Array.isArray(pairs)) {
                for (const pair of pairs) {
                    this.set(pair.key, pair.value);
                }
            } else {
                this.set(pairs.key, pairs.value);
            }
        }
    }

    /**
     * Adds new key/value pair into the dictionary.
     * @method add
     * @param {string} key The key
     * @param {*} value The value
     * @memberOf StockChartX.Dictionary#
     */
    set(key: TKey, value: TValue) {
        this._dict[<any> key] = value;
        this._length++;
    }

    /**
     * Removes key/value pair by a given key.
     * @method remove
     * @param {string} key The key to be removed.
     * @returns {boolean} True if pair has been removed, false if key is present in the dictionary.
     * @memberOf StockChartX.Dictionary#
     */
    remove(key: TKey): boolean {
        if (!this.containsKey(key)) {
            return false;
        }

        delete this._dict[<any> key];
        this._length--;

        return true;
    }

    /**
     * Removes all keys and values from the dictionary.
     * @method clear
     * @memberOf StockChartX.Dictionary#
     */
    clear(): void {
        this._length = 0;
        this._dict = {};
    }

    /**
     * Checks whether given key is present in the dictionary.
     * @method containsKey
     * @param {string} key The key.
     * @returns {boolean} True if key is present in the dictionary, false otherwise.
     * @memberOf StockChartX.Dictionary#
     */
    containsKey(key: TKey): boolean {
        return this._dict[<any> key] !== undefined;
    }

    /**
     * Returns value by a given key.
     * @method get
     * @param {string} key The key.
     * @returns {*} Value by by a given key.
     * @memberOf StockChartX.Dictionary#
     */
    get(key: TKey): TValue {
        return this.containsKey(key) ? this._dict[<any> key] : null;
    }

    values(): TValue[] {
        const arr = [];

        for (const key in this.keys()) {
            arr.push(this.get(key as TKey));
        }

        return arr;
    }

    keys(): string[] {
        return Object.keys(this._dict);
    }
}
