import { FormGroup } from '@angular/forms';

export function getErrorMessage(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);
    if (!control?.touched || !control.errors) {
        return null;
    }

    const errors = control.errors;
    const fieldName = getFieldName(controlName); // Arabic field names

    if (errors['required']) {
        return `${fieldName} مطلوب.`;
    }
    if (errors['min']) {
        return `${fieldName} يجب أن يكون أكبر من القيمة الدنيا المسموح بها.`;
    }
    if (errors['max']) {
        return `${fieldName} يجب أن يكون أقل من القيمة القصوى المسموح بها.`;
    }
    if (errors['minlength']) {
        return `${fieldName} يجب أن يكون ${errors['minlength'].requiredLength} أحرف على الأقل.`;
    }
    if (errors['maxlength']) {
        return `${fieldName} لا يمكن أن يتجاوز ${errors['maxlength'].requiredLength} أحرف.`;
    }
    if (errors['pattern']) {
        return `صيغة ${fieldName} غير صحيحة.`;
    }
    if (errors['positiveNumber']) {
        return `${fieldName} يجب أن يكون رقم إيجابي.`;
    }
    if (errors['requiredFile']) {
        return 'ملف صورة مطلوب.';
    }
    if (errors['email']) {
        return 'صيغة البريد الإلكتروني غير صحيحة';
    }

    return null; // لا يوجد خطأ
}

function getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
        'email': 'البريد الإلكتروني',
        'password': 'كلمة المرور',
        'name': 'الاسم',
        'phone': 'رقم الهاتف',
        'title': 'العنوان',
        'description': 'الوصف',
        'price': 'السعر',
        'quantity': 'الكمية',
        'date': 'التاريخ',
        'time': 'الوقت'
    };

    return fieldNames[controlName] || controlName;
}