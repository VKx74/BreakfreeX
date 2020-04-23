import {IIdentityToken} from "@app/models/auth/auth.models";

export class IdentityTokenParser {
    static parseToken(token: string): IIdentityToken {
        const base64Url = token.split('.')[1];

        if (base64Url) {
            const base64 = base64Url.replace('-', '+')
                .replace('_', '/');

            return JSON.parse(window.atob(base64)) as IIdentityToken;
        }

        return null;
    }
}
