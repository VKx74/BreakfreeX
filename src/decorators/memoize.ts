import * as memoizee from 'memoizee';

export interface IMemoizeConfig {
    async?: boolean; // function Operations that result with an error are not cached
    maxAge?: number;
    primitive?: boolean; // provide fast access, results are saved in hash instead of an array
    refCounter?: boolean; // track number of references returned from cache
    max?: number; //  limit cache size
}

const DefaultMemoizeConfig: IMemoizeConfig = {
    maxAge: 60000,
};

export function memoize(config: IMemoizeConfig = DefaultMemoizeConfig) {
    return function (target, key, descriptor) {
        const oldFunction = descriptor.value;
        const newFunction = memoizee(oldFunction, config);
        descriptor.value = function () {
            return newFunction.apply(this, arguments);
        };
    };
}
