import { Component, Input, Output, EventEmitter } from '@angular/core';

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
    selector: 'color-selector',
    templateUrl: './color-selector.component.html',
    styleUrls: ['./color-selector.component.scss'],
})
export class ColorSelectorComponent {
    @Input()  activeColor: string;
    @Input()  path: string;
    @Output() activeColorChange = new EventEmitter<string>();



    get Colors() {
        return Colors;
    }

    get colorDisabled(): boolean {
        return this.activeColor == null;
    }

    handleColorSelected(color: string) {
        this.activeColor = color;
        this.activeColorChange.emit(this.activeColor);
    }

    disableLinking() {
        this.activeColor = null;
        this.activeColorChange.emit(this.activeColor);
    }
}
