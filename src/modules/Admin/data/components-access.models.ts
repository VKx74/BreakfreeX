import {ComponentIdentifier} from "@app/models/app-config";
import {ComponentAccessService, IUIComponent, UIElementType} from "@app/services/component-access.service";

export class UIComponent implements IUIComponent {
    id: number;
    name: ComponentIdentifier;
    type: UIElementType;
    checked: boolean;

    constructor(id: number, name: ComponentIdentifier, type: UIElementType, checked = false) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.checked = checked !== null ? checked : ComponentAccessService.isAccessible(name);
    }

    static fromObject(obj: IUIComponent, checked?: boolean): UIComponent {
        if (checked !== null) {
            return new UIComponent(obj.id, obj.name, obj.type, checked != null ? checked : obj.checked);
        }
    }
}
