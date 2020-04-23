import { Injectable } from "@angular/core";
import { IdentityService } from "../../../app/services/auth/identity.service";
import { TemplatesStorageService } from './templates-storage.service';
import { AlertService } from '@alert/services/alert.service';


const templatesPath = [
    '../node_modules/trading-chart-designer/assets/data/predefined-templates/standartCandleTemplate.json',
    '../node_modules/trading-chart-designer/assets/data/predefined-templates/bigTreeTemplate.json',
    '../node_modules/trading-chart-designer/assets/data/predefined-templates/renkoTemplate.json',
    '../node_modules/trading-chart-designer/assets/data/predefined-templates/multiIndicator.json',
    '../node_modules/trading-chart-designer/assets/data/predefined-templates/EMAAndMACDTemplate.json',
];

export interface IChartTemplate {
    id: string;
    name: string;
    state: any;
}

@Injectable()
export class TemplatesDataProviderService extends TradingChartDesigner.TemplatesDataProvider {
    private _templateListPath: any;
    private readonly LocalStorageTemplates: string;

    constructor(private _identityService: IdentityService,
        private _templateStorageService: TemplatesStorageService,
        private _alertService: AlertService) {
        super();
        this.LocalStorageTemplates = this._identityService.id + 'template';
        this._templateListPath = templatesPath;
    }

    public editTemplate(id: string | number, newName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._templateStorageService.editTemplate(id, newName)
                .subscribe(
                    (data) => {
                        const templateIndex = this._templatesList.findIndex(item => item.id === id);
                        this._templatesList[templateIndex].name = newName;

                        this.updateTemplateListInLocalStorage();
                        this.notifyUpdateListeners();
                        resolve('elem edited');
                    },
                    (error) => {
                        this._alertService.error("Could not edit template name", "Error");
                        reject();
                    }
                );
        });
    }

    public templateById(id: string): TradingChartDesigner.IChartTemplate {
        return this._templatesList.filter(item => item.id === id)[0];
    }

    public templateList(): Promise<IChartTemplate[]> {
        return new Promise((resolve, reject) => {
            if (this._templatesList && this._templatesList.length > 0) {
                resolve(this._templatesList);
            } else {
                let result = this._templateStorageService.allTemplates();
                result.subscribe(
                    (data) => {
                        this._templatesList = data;                        
                        resolve(data);
                    },
                    (error) => {
                        this._templatesList = new Array();
                        resolve(this._templatesList);
                        // this._templatesList = JSON.parse(localStorage.getItem(this.LocalStorageTemplates));
                        // if (this._templatesList) {
                        //     resolve(this._templatesList);
                        // } else {
                        //     this._getTemplateListFromFiles().then(data => {
                        //         this._templatesList = data;
                        //         localStorage.setItem(this.LocalStorageTemplates, JSON.stringify(data));
                        //         resolve(this._templatesList);
                        //     });
                        // }
                    }
                );
            }
        });
    }

    public removeTemplate(id: string | number): Promise<string> {
        return new Promise((resolve, reject) => {
            this._templateStorageService.removeTemplate(id.toString())
                .subscribe(
                    (data) => {
                        this._templatesList.splice(this._templatesList.findIndex(item => item.id === id), 1);
                        // this.updateTemplateListInLocalStorage();
                        this.notifyUpdateListeners();
                        resolve('item removed from db');
                    },
                    (error) => {
                        this._alertService.error("Could not delete template", "Error");
                        reject();
                    }
                );
        });
    }

    public saveTemplate(name: string, state: TradingChartDesigner.IChartTemplateState): Promise<any> {
        return new Promise((resolve, reject) => {
            const newItem = {
                name,
                id: this._generateID(), // `${Math.random()}`,
                state
            };

            if (newItem.state.theme) {
                delete newItem.state.theme;
            }
            this._templateStorageService.saveTemplate(newItem)
                .subscribe(
                    (data) => {
                        this._templatesList.push(newItem);
                        // this.updateTemplateListInLocalStorage();
                        this.notifyUpdateListeners();
                        resolve({ name: newItem.name, id: newItem.id });
                    },
                    (error) => {
                        this._alertService.error("Could not create template", "Error");
                        reject();
                    }
                );
        });
    }

    private _getTemplateListFromFiles(): Promise<IChartTemplate[]> {
        const templateFilePromise: IChartTemplate[] = this._templateListPath.map(async path => await $.getJSON(path));

        return Promise.all(templateFilePromise);
    }

    public updateTemplateListInLocalStorage(): void {
        localStorage.setItem(this.LocalStorageTemplates, JSON.stringify(this._templatesList));
    }

    private _generateID() {
        let rnd = () => Math.random().toString(36).substr(2);
        return `${rnd()}_${rnd()}_${rnd()}`;        
    }
}
