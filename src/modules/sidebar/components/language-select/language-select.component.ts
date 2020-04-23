import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Locale} from "Localization";

export interface ILanguageOption {
    locale: Locale;
    name: string;
    src: string;
}

@Component({
    selector: 'language-select',
    templateUrl: './language-select.component.html',
    styleUrls: ['./language-select.component.scss']
})
export class LanguageSelectComponent implements OnInit {
    @Output() languageChange = new EventEmitter<ILanguageOption>();
    @Input() locale: Locale;
    @Input() languages: ILanguageOption[] = [
        {
            locale: Locale.EN,
            name: 'English',
            src: 'assets/img/flags/gbp.png',
        },
        {
            locale: Locale.UA,
            name: 'Українська',
            src: 'assets/img/flags/uah.png'
        }
    ];
    languageOptionShown = false;

    get localeInfo() {
        return this.languages.find(l => l.locale === this.locale);
    }

    constructor() {
    }

    ngOnInit() {
        this.locale = this.locale || this.languages[0].locale;
    }

    toggleLanguageOptions() {
        this.languageOptionShown = !this.languageOptionShown;
    }


    setLanguage(language: ILanguageOption) {
        this.languageOptionShown = false;
        this.locale = language.locale;
        this.languageChange.emit(language);
    }

}
