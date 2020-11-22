import {IIdentityToken} from "@app/models/auth/auth.models";

export class IdentityTokenParser {
    static parseToken(token: string): IIdentityToken {
        const base64Url = token.split('.')[1] as any;

        if (base64Url) {
            // const base64 = base64Url.replaceAll('-', '+')
            //     .replaceAll('_', '/');

            const search = '-';
            const searchRegExp = new RegExp(search, 'g'); // Throws SyntaxError
            const replaceWith = '+';
            let base64 = base64Url.replace(searchRegExp, replaceWith);

            const search2 = '_';
            const searchRegExp2 = new RegExp(search2, 'g'); // Throws SyntaxError
            const replaceWith2 = '/';
            base64 = base64.replace(searchRegExp2, replaceWith2);

            return JSON.parse(window.atob(base64)) as IIdentityToken;
        }

        return null;
    }
}
