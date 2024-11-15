import 'hammerjs';
import 'polyfills';
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {environment} from './environments/environment';
import {AppModule} from "@app/app.module";

if (environment.production) {
    enableProdMode();
}

console.log('MAIN TS CALL');
platformBrowserDynamic().bootstrapModule(AppModule);

