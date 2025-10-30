import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../core/interfaces/IBaseApiResponse';
import { CustomerService } from '../../services/customer.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent, RouterLink],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent {
  companyForm: FormGroup;
  private toster = inject(ToastService);


  logoPreview: string | null = null;
  logoFile: File | null = null;
  documentsFiles: File[] = [];
  documentsPreview: string[] = [];

  logoError: string | null = null;
  documentsError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private companyService: CustomerService
  ) {
    this.companyForm = this.fb.group({
      companyNameArabic: ['', [Validators.required, Validators.minLength(3)]],
      companyNameEnglish: ['', [Validators.required, Validators.minLength(3)]],
      responsiblePerson: ['', [Validators.required, Validators.minLength(3)]],
      identityId: ['', [Validators.required, Validators.pattern(/^\d{10,14}$/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^(\+?\d{10,15})$/)]],
      email: ['', [Validators.required, Validators.email]],
      passwordHash: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      pumpImageRequired: [false],
      carImageRequired: [false],
      carLimitType: ['monthly', [Validators.required]],
      carLimitCount: [0, [Validators.required, Validators.min(1)]],
      monthlyCostPerCar: [0, [Validators.required, Validators.min(0)]],
      status: ['pending', [Validators.required]]
    });
  }

  onLogoSelect(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
    if (!this.validateFile(file, 'logo')) return;

    this.logoFile = file;
    this.logoError = null;

    const reader = new FileReader();
    reader.onload = () => (this.logoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  onDocumentsSelect(event: Event) {
    const files = Array.from((event.target as HTMLInputElement)?.files || []);
    if (!files.length) return;

    for (const file of files) if (!this.validateFile(file, 'document')) return;

    this.documentsFiles = files;
    this.documentsError = null;
    this.documentsPreview = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.documentsPreview.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  private validateFile(file: File, type: 'logo' | 'document'): boolean {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (type === 'document') allowed.push('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    if (file.size > maxSize) {
      const msg = 'حجم الملف يجب أن يكون أقل من 2 ميغابايت';
      type === 'logo' ? this.logoError = msg : this.documentsError = msg;
      return false;
    }
    if (!allowed.includes(file.type)) {
      const msg = 'نوع الملف غير مدعوم';
      type === 'logo' ? this.logoError = msg : this.documentsError = msg;
      return false;
    }
    return true;
  }

  removeLogo() {
    this.logoFile = null;
    this.logoPreview = null;
    this.logoError = null;
    (document.getElementById('upload-logo') as HTMLInputElement).value = '';
  }

  removeDocument(index: number) {
    this.documentsFiles.splice(index, 1);
    this.documentsPreview.splice(index, 1);
    if (!this.documentsFiles.length) (document.getElementById('upload-documents') as HTMLInputElement).value = '';
  }

  private prepareFormData(): FormData {
    const fd = new FormData();
    Object.entries(this.companyForm.value).forEach(([key, value]) => fd.append(key, value?.toString() || ''));
    if (this.logoFile) fd.append('logo', this.logoFile, this.logoFile.name);
    this.documentsFiles.forEach(file => fd.append('documents', file, file.name));
    return fd;
  }

  onCancel() {
    this.router.navigate(['/dashboard/customers']);
  }

  async onSubmit() {
    if (this.companyForm.invalid) return this.companyForm.markAllAsTouched();

    const formData = this.prepareFormData();
    this.companyService.createCompany(formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message);
        if (res.statusCode === 200) this.router.navigate(['/dashboard/customers']);
        else alert(res.message);
      },
      error: err => console.error('Create company failed', err)
    });
  }

  // Getters
  get companyNameArabic() { return this.companyForm.get('companyNameArabic'); }
  get companyNameEnglish() { return this.companyForm.get('companyNameEnglish'); }
  get responsiblePerson() { return this.companyForm.get('responsiblePerson'); }
  get identityId() { return this.companyForm.get('identityId'); }
  get mobile() { return this.companyForm.get('mobile'); }
  get email() { return this.companyForm.get('email'); }
  get passwordHash() { return this.companyForm.get('passwordHash'); }
  get address() { return this.companyForm.get('address'); }
  get pumpImageRequired() { return this.companyForm.get('pumpImageRequired'); }
  get carImageRequired() { return this.companyForm.get('carImageRequired'); }
  get carLimitType() { return this.companyForm.get('carLimitType'); }
  get carLimitCount() { return this.companyForm.get('carLimitCount'); }
  get monthlyCostPerCar() { return this.companyForm.get('monthlyCostPerCar'); }
  get status() { return this.companyForm.get('status'); }
}
