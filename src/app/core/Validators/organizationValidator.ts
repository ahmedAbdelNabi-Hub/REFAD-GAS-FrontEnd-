import { AbstractControl, ValidatorFn } from "@angular/forms";

function orgKeyValidator(): ValidatorFn {
    return (ctrl: AbstractControl) => {
        const val = ctrl.value || '';
        return /^[A-Z0-9]{2,10}$/.test(val) ? null : { invalidOrgKey: true };
    };
}

