import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Linker} from "../../linking-manager";

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

    get activeLinking(): string {
        return this.linker && this.linker.linkingId;
    }

    get linkingDisabled(): boolean {
        return this.linker && this.linker.linkingId == null;
    }

    get showLinker(): boolean {
        return this.linker && this.linker.showLinkerTab;
    }

    handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    ngOnInit(): void {
        this._cdRef.reattach();
    }
}
