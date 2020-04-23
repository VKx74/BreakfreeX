import {Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import {EMOJIS} from "./emojis";

@Component({
    selector: 'emoji-picker',
    templateUrl: './emoji-picker.component.html',
    styleUrls: ['./emoji-picker.component.scss']
})

export class EmojiPickerComponent {
    public emojiList: string[] = EMOJIS.map(emojiCode => String.fromCodePoint(emojiCode));

    @Output() onEmojiClick: EventEmitter<string> = new EventEmitter<string>();
}
