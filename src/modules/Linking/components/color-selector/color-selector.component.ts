import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Colors } from '@linking/linking-manager';

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
