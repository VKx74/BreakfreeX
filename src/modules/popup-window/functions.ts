import {ISharedProviders} from "./interfaces";
import {PopupWindowSharedProvidersKey} from "./constants";


export function sharedProviderResolver(providerAlias: keyof ISharedProviders) {
    const sharedProviders: ISharedProviders = (window as any)[PopupWindowSharedProvidersKey];

    if (!sharedProviders) {
        return;
    }

    const provider = sharedProviders[providerAlias];

    // if (!provider) {
    //     throw new Error(`Provider not found: ${providerAlias}`);
    // }

    return provider;
}

export function isPopupWindow(): boolean {
    return (window as any)[PopupWindowSharedProvidersKey] != null;
}
