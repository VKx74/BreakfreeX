import {IInstrument} from "../app/models/common/instrument";
import {Observable, of} from "rxjs";

declare let $: JQueryStatic;
declare let moment: any;

export class JsUtil {
    static isString(str: any): boolean {
        return typeof str === 'string';
    }

    static isObject(data: any): boolean {
        return data === Object(data);
    }

    static arrayOfUniques(array: any[]): any[] {
        const uniques = array.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        return uniques;
    }

    static arrayContainsDuplicates(array: any[]): boolean {
        for (let i = 0; i < array.length; i++) {
            const itemsExceptCurrent = array.filter((item, index) => index !== i);

            if (itemsExceptCurrent.indexOf(array[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    static getAsObservable(value: string | Observable<string>): Observable<string> {
        if (value instanceof Observable) {
            return value;
        }

        return of(value);
    }

    static generateGUID(): string {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    static generateAlertName(): string {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };

        return "Alert_" + s4() + '_' + s4() + '_' + s4() + '_' + s4();
    }

    static clone<T extends object>(obj: T): T {
        const result = jQuery.extend(true, {}, obj);
        for (const prop in result) {

            if (!result.hasOwnProperty(prop)) {
                continue;
            }

            const arr = result[prop];

            if (!Array.isArray(arr)) {
                continue;
            }

            for (let i = 0, count = arr.length; i < count; i++) {
                if (typeof arr[i] === 'object') {
                    arr[i] = this.clone(arr[i]);
                }
            }
        }

        return result;
    }

    static copy(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    static dataURItoBlob(dataURI): Blob {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);

        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], {type: mimeString});

        return blob;
    }

    static convertDictionaryToArray(dictionary): Array<{ key: string, value: any }> {
        const arr = [];

        for (const prop in dictionary) {
            arr.push({key: prop, value: dictionary[prop]});
        }

        return arr;
    }

    static getBaseUrl(): string {
        const url = window.location.origin + window.location.pathname;
        return url.lastIndexOf('.html') ? url.replace(url.substring(url.lastIndexOf('/') + 1), '') : url;
    }

    static remainTime(endDate: Date | String) {
        if (typeof endDate === 'string') {
            endDate = new Date(endDate);
        }

        const now = moment(),
            timeDiff = (<any>moment(endDate)) - (<any>now);

        const dur = moment.duration(timeDiff);

        return {
            years: dur.years(),
            days: dur.days(),
            hours: dur.hours(),
            minutes: dur.minutes(),
            seconds: dur.seconds()
        };
    }

    static formatDate(date: string): string {
        const d = new Date(date);
        // 01, 02, 03, ... 29, 30, 31
        const dd = (d.getDate() < 10 ? '0' : '') + d.getDate();
        // 01, 02, 03, ... 10, 11, 12
        const MM = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1);
        // 1970, 1971, ... 2015, 2016, ...
        const yyyy = d.getFullYear();
        // 1, 10, 13, 20
        const hh = ((d.getHours() + 1) < 10 ? '0' : '') + d.getHours();
        // 15, 20, 31
        const mm = ((d.getMinutes() + 1) < 10 ? '0' : '') + d.getMinutes();

        return dd + "/" + MM + "/" + yyyy + ' ' + hh + ':' + mm;
        // return new Date(date).toISOString().substr(0, 16).replace('T', ' ').replace(/-/g, '/');
    }

    static durationToTime(durationInMs: number) {
        const milliseconds = Math.trunc((durationInMs % 1000) / 100),
            seconds = Math.trunc((durationInMs / 1000) % 60),
            minutes = Math.trunc((durationInMs / (1000 * 60)) % 60),
            hours = Math.trunc((durationInMs / (1000 * 60 * 60)) % 24);

        return {
            hours,
            minutes,
            seconds,
            milliseconds
        };
    }

    static getFormattedDuration(durationInMs: number): string {
        const {hours, minutes, seconds} = JsUtil.durationToTime(durationInMs);

        let str = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

        if (hours) {
            str = `${hours}:${str}`;
        }

        return str;
    }

    static getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    static getRandomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static roundNumber(number: number, decimalCount: number): number {
        return Math.round(number * Math.pow(10, decimalCount)) / Math.pow(10, decimalCount);
    }

    static flattenArray<T>(array: any[]): T[] {
        return array.reduce((prev: any[], cur: T) => {
            if (Array.isArray(cur))
                return prev.concat(this.flattenArray(cur));

            return prev.concat(cur);
        }, []);
    }

    static promiseDelay(delay: number): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, delay);
        });
    }

    static serializeWindowOptions(windowOptions: any) {
        const windowOptionsString = [];

        for (const key in windowOptions) {
            windowOptionsString.push(key + '=' + windowOptions[key]);
        }

        return windowOptionsString.join(',');
    }

    static getInstrumentHash(instrument: IInstrument): string {
        return instrument.id + "." + instrument.exchange + "." + instrument.datafeed;
    }

    static UTCDate(date: number | Date): Date {
        const utcMoment = moment(date).utc();
        const convertedDate = new Date(
            utcMoment.year(),
            utcMoment.month(),
            utcMoment.date(),
            utcMoment.hour(),
            utcMoment.minutes(),
            utcMoment.second(),
            utcMoment.millisecond()
        );

        return convertedDate;
    }

    static getRootUrl(): string {
        return window.location.protocol + "//" + window.location.hostname + ":" +
            window.location.port;
    }

    static formatMomentDate(date: Date | number | string | moment.Moment, format: string): string {
        return moment(date).format(format);
    }

    static enterKeyListener(element: HTMLElement, cb: (event?: HTMLElementEventMap) => void) {
        element.addEventListener('keydown', (event: any) => {
            setTimeout(() => {
                if (event.keyCode === 13) { // Enter
                    cb(event);
                }
            });
        });
    }

    static stringEnumToArray<T>(Enum: any): T[] {
        return Object.keys(Enum)
            .map((key: string) => Enum[key]);
    }

    static numericEnumToArray<T>(Enum: any): T[] {
        return Object.keys(Enum)
            .filter((value) => isNaN(Number(value)))
            .map(key => Enum[key]);
    }

    static numericEnumNameByValue<T>(Enum: any, value: T): string {
        return Enum[value];
    }

    static stringEnumNameByValue<T>(Enum: any, value: T): string {
        return Object.keys(Enum)
            .find((enumProp) => Enum[enumProp] === value);
    }

    static replaceArrayItem<T = any>(arr: T[], selector: (item: T) => boolean, item: T): T[] {
        arr = arr.slice();
        const index = arr.findIndex(selector);

        if (index !== -1) {
            arr.splice(index, 1, item);
        }

        return arr;
    }

    static mapOfArraysToArray<T>(_map: { [prop: string]: T[] }): T[] {
        return Object.keys(_map).reduce((acc, prop) => {
            return [].concat(...acc, ..._map[prop]);
        }, []);
    }

    static copyStringToClipboard(str: string) {
        let el = document.createElement('textarea') as any;

        el.value = str;
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }


    static fileToDataURI(file: File): Observable<string> {
        return new Observable((observer) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                observer.next(reader.result as string);
            };

            reader.readAsDataURL(file);
        });
    }

    static dataUriToFile(url: string, fileName: string): File {
        return new File([JsUtil.dataURItoBlob(url)], fileName, {type: 'image/png'});
    }

    static imageUrlToFile(url: string, fileName: string): Observable<File> {
        return new Observable<File>((observer) => {
            fetch(url)
                .then((resp) => resp.blob())
                .then((blob) => {
                    let file = new File([blob], fileName, {
                        type: 'image/png'
                    });

                    observer.next(file);
                })
                .catch((e) => {
                    console.error(e);

                    observer.next(e);
                });
        });
    }

    static getArrayLastValue<T = any>(arr: T[]): T {
        if (arr.length === 0) {
            return null;
        }

        return arr[arr.length - 1];
    }

    static removeObjectProperty<T = any>(obj: T, prop: string): T {
        const copy = Object.assign({}, obj);
        delete copy[prop];

        return copy;
    }
}


(window as any).JsUtil = JsUtil;
