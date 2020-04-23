import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Linker} from "../../linking-manager";

export const Colors = [
    '#098BB8',
    '#1A998A',
    '#EF2C35',
    '#DE8408',
    '#5B3E84',
    '#DCB0D1',
    '#A8A135',
    '#74D3C1'
];

@Component({
    selector: 'link-selector',
    templateUrl: './link-selector.component.html',
    styleUrls: ['./link-selector.component.scss'],
})
export class LinkSelectorComponent implements OnInit {
    @Input() linker: Linker;

    constructor(private _cdRef: ChangeDetectorRef) {
        this._cdRef.detach();
    }

    get Colors() {
        return Colors;
    }

    get activeLinking(): string {
        return this.linker && this.linker.linkingId;
    }

    get linkingDisabled(): boolean {
        return this.linker && this.linker.linkingId == null;
    }

    handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    disableLinking() {
        this.linker.setLinking(null);
    }

    ngOnInit(): void {
        this._cdRef.reattach();
    }
}
