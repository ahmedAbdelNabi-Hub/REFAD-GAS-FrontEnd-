import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getErrorMessage } from '../../../core/utils/ErrorMessage';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.css']
})
export class FormErrorComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;

  isControlInvalid(): boolean {
    const control = this.form.get(this.controlName);
    return !!(control && control.invalid && control.touched && control.dirty);
  }

  get errorMessage(): string | null {
    return getErrorMessage(this.form, this.controlName);
  }
}
