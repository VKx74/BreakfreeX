import {FormGroup} from "@angular/forms";

export function passwordsMatchValidator(passwordControlName: string, confirmPasswordControlName: string) {
    return (group: FormGroup) => {
        const passwordControl = group.controls[passwordControlName];
        const confirmPasswordControl = group.controls[confirmPasswordControlName];

        if (passwordControl.invalid || passwordControl.value.trim().length === 0 || confirmPasswordControl.pristine) {
            return null;
        }

        if (passwordControl.value !== confirmPasswordControl.value) {
            return {
                mismatchPasswords: true
            };
        }
    };
}
