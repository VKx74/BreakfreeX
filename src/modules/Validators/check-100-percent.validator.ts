import {FormGroup} from "@angular/forms";

export function check100PercentValidator(controlNames: string[], error: string) {
    return (group: FormGroup) => {
        const controls = [];
        let sumControlsValues = 0;

        for (let control of controlNames) {
            controls.push(group.controls[control]);
            sumControlsValues += group.controls[control].value;
        }

        if (sumControlsValues !== 100) {
            return {
                message: error
            };
        }
    };
}