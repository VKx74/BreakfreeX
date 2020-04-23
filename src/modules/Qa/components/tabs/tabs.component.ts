import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface ITab {
    id: string;
    label: string;
}

@Component({
    selector: 'tabs',
    templateUrl: 'tabs.component.html',
    styleUrls: ['tabs.component.scss']
})
export class TabsComponent implements OnInit {
    @Input() title: string;
    @Input() tabs: ITab[];
    @Input() activeTab: ITab;
    @Output() onSelectTab = new EventEmitter<ITab>();

    ngOnInit() {
    }

    activate(tab: ITab) {
        if (tab.id === this.activeTab.id) {
            return;
        }

        this.onSelectTab.emit(tab);
    }
}
