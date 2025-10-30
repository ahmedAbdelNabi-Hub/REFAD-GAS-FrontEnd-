import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { ToastService } from '../../../../../core/services/toast.service';
import { SupervisorService } from '../../../services/supervisor.service';
import { FormErrorComponent } from "../../../../../shared/components/form-error/form-error.component";
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs';

@Component({
  selector: 'app-update-supervisor',
  imports: [FormErrorComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './update-supervisor.html',
  styleUrl: './update-supervisor.css'
})
export class UpdateSupervisor implements OnInit {
  supervisorForm: FormGroup;
  private toster = inject(ToastService);
  private supervisorService = inject(SupervisorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  supervisorId: string = this.route.snapshot.paramMap.get('id') as string;

  roleOptions = [
    { value: 'admin', label: 'مدير عام' },
    { value: 'super_admin', label: 'مشرف' },
  ];

  constructor(private fb: FormBuilder) {
    this.supervisorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      passwordHash: ['', [Validators.minLength(8)]], // Password is optional for updates
      role: ['super_admin', [Validators.required]]
    });
  }

  ngOnInit() {

    this.fetchSupervisor();

  }

  fetchSupervisor() {
    this.supervisorService.getSupervisorById(this.supervisorId).pipe(tap(res => {
      this.supervisorForm.patchValue({
        email: res.email,
        fullName: res.fullName,
        role: res.role,
        passwordHash: ''
      });
    })).subscribe()
  }

  onCancel() {
    this.router.navigate(['/dashboard/supervisors']);
  }

  onSubmit() {
    if (this.supervisorForm.invalid) {
      this.supervisorForm.markAllAsTouched();
      return;
    }
    const formData = this.supervisorForm.value;
    console.log(formData);
    this.supervisorService.updateSupervisor(this.supervisorId, formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message || 'تم تحديث المشرف بنجاح');
        if (res.statusCode === 200) {
          this.router.navigate(['/dashboard/supervisors']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ أثناء تحديث المشرف');
        }
      },
      error: (err) => {
        this.toster.showError('حدث خطأ أثناء تحديث المشرف');
        console.error('Update supervisor error:', err);
      }
    });
  }

  // Getters
  get email() { return this.supervisorForm.get('email'); }
  get fullName() { return this.supervisorForm.get('fullName'); }
  get passwordHash() { return this.supervisorForm.get('passwordHash'); }
  get role() { return this.supervisorForm.get('role'); }
}