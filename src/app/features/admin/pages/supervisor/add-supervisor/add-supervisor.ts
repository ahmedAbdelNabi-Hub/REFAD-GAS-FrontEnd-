import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { ToastService } from '../../../../../core/services/toast.service';
import { FormErrorComponent } from '../../../../../shared/components/form-error/form-error.component';
import { SupervisorService } from '../../../services/supervisor.service';

@Component({
  selector: 'app-add-supervisor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent],
  templateUrl: './add-supervisor.html',
  styleUrls: ['./add-supervisor.css']
})
export class AddSupervisorComponent {
  supervisorForm: FormGroup;
  private toster = inject(ToastService);
  private supervisorService = inject(SupervisorService);

  roleOptions = [
    { value: 'admin', label: 'مدير عام' },
    { value: 'super_admin', label: 'مشرف' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.supervisorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      passwordHash: ['', [Validators.required, Validators.minLength(8)]],
      role: ['super_admin', [Validators.required]]
    });
  }

  onCancel() {
    this.router.navigate(['/admin/supervisors']);
  }

  onSubmit() {
    if (this.supervisorForm.invalid) {
      this.supervisorForm.markAllAsTouched();
      return;
    }
    const formData = this.supervisorForm.value;
    this.supervisorService.createSupervisor(formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message || 'تم إضافة المشرف بنجاح');
        if (res.statusCode === 200) {
          this.router.navigate(['/admin/supervisors']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ أثناء إضافة المشرف');
        }
      },
      error: (err) => {
        this.toster.showError('حدث خطأ أثناء إضافة المشرف');
        console.error('Create supervisor error:', err);
      }
    });
  }


  get email() { return this.supervisorForm.get('email'); }
  get fullName() { return this.supervisorForm.get('fullName'); }
  get passwordHash() { return this.supervisorForm.get('passwordHash'); }
  get role() { return this.supervisorForm.get('role'); }
}