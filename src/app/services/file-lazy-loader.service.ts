import {Injectable} from "@angular/core";

export interface IScript {
    src: string;
    charset?: string;
    type?: string;
}

export interface IStyle {
    href: string;
    rel?: string;
}

declare let document: any;

@Injectable({
    providedIn: 'root'
})
export class FileLazyLoader {
    private _files: { [url: string]: Promise<any> } = {};


    async loadScripts(scripts: IScript[]): Promise<any> {
        return Promise.all(scripts.map((s) => this.loadScript(s)));
    }

    private loadScript(script: IScript): Promise<any> {
        const scriptElement: HTMLScriptElement = document.createElement('script');

        scriptElement.src = script.src;
        scriptElement.async = false;

        if (script.charset != null) {
            scriptElement.charset = script.charset;
        }

        if (script.type != null) {
            scriptElement.type = script.type;
        }

        return this._loadFile(script.src, scriptElement);
    }

    async loadStyles(_styles: IStyle[]): Promise<any> {
        return Promise.all(_styles.map((s) => this.loadStyle(s)));
    }

    private loadStyle(style: IStyle): Promise<any> {
        const styleElement: HTMLLinkElement = document.createElement('link');

        styleElement.href = style.href;
        styleElement.rel = style.rel || 'stylesheet';

        return this._loadFile(style.href, styleElement);
    }

    private _loadFile(url: string, element: any): Promise<any> {
        if (this._files[url] == null) {
            this._files[url] = this._injectElement(element)
                .then(() => {
                    this._files[url] = Promise.resolve();
                })
                .catch((e) => {
                    this._files[url] = null;
                    throw e;
                });
        }

        return Promise.resolve(this._files[url]);
    }

    private _injectElement(element: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (element.readyState) {  // IE
                element.onreadystatechange = () => {
                    if (element.readyState === "loaded" || element.readyState === "complete") {
                        resolve(true);
                    }
                };
            } else {  // Others
                element.onload = () => {
                    resolve(true);
                };
            }

            element.onerror = reject;
            document.getElementsByTagName('head')[0].appendChild(element);
        });
    }
}
