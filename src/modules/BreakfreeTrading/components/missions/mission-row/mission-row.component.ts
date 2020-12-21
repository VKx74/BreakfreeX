import {Component, Inject, Injector, Input, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'mission-row-component',
    templateUrl: './mission-row.component.html',
    styleUrls: ['./mission-row.component.scss']
})
export class MissionRowComponent {
    @Input() Name: string;
    @Input() Points: number;
    @Input() Needed: number;
    @Input() Current: number;
    @Input() Failed: boolean;
    @Input() FailedDescription: string;

    public get current(): number {
        if (this.Current > this.Needed) {
            return this.Needed;
        }
        return this.Current;
    } 
    
    public get value(): number {
        if (!this.Current || !this.Needed) {
            return 0;
        }

        return this.current / this.Needed * 100;
    } 
    
    public get claimed(): boolean {
        if (!this.Current || !this.Needed) {
            return false;
        }

        return this.Current >= this.Needed;
    }

    public get failed(): boolean {
        return this.Failed;
    }

    public get failedDescription(): string {
        return this.FailedDescription;
    }

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
