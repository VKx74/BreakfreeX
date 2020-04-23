import {Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy} from "@angular/core";

@Pipe({
    name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
    constructor() {
    }

    transform(date: string | Date | number) {
        let d = new Date(date);
        let now = new Date();
        let seconds = Math.round(Math.abs((Math.max(now.getTime() - d.getTime(), 1) + d.getTimezoneOffset() * 60000) / 1000));
        if (Number.isNaN(seconds)) {
            return '';
        }

        return moment(date).fromNow();
    }
}
