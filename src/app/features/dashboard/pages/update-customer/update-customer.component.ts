import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../core/interfaces/IBaseApiResponse';
import { CustomerService } from '../../services/customer.service';
import { ToastService } from '../../../../core/services/toast.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-update-customer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, FormErrorComponent],
  templateUrl: './update-customer.component.html',
  styleUrls: ['./update-customer.component.css']
})
export class UpdateCustomerComponent implements OnInit {
  private readonly API_BASE_URL = 'https://localhost:7069';
  companyForm: FormGroup;
  private toster = inject(ToastService);
  private route = inject(ActivatedRoute);

  companyId: string = '';
  isLoading: boolean = true;

  logoPreview = signal<string | null>(null);
  logoFile: File | null = null;
  existingLogoUrl: string | null = null;

  documentsFiles: File[] = [];
  documentsPreview: string[] = [];
  existingDocuments: any[] = [];

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
      passwordHash: [''],  // Optional for update
      address: ['', [Validators.required, Validators.minLength(5)]],
      pumpImageRequired: [false],
      carImageRequired: [false],
      carLimitType: ['monthly', [Validators.required]],
      carLimitCount: [0, [Validators.required, Validators.min(1)]],
      monthlyCostPerCar: [0, [Validators.required, Validators.min(0)]],
      status: ['pending', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
    if (this.companyId) {
      this.loadCompanyData();
    } else {
      this.toster.showError('معرف الشركة غير صالح');
      this.router.navigate(['/dashboard/customers']);
    }
  }

  loadCompanyData(): void {
    this.isLoading = true;
    this.companyService.getCompanyById(this.companyId)
      .pipe(tap(res => {
        const company = res || res;
        console.log('Company data:', company);
        this.patchFormValues(company);
        this.isLoading = false;
      }))
      .subscribe({

      });
  }

  patchFormValues(company: any): void {
    this.companyForm.patchValue({
      companyNameArabic: company.companyNameArabic || '',
      companyNameEnglish: company.companyNameEnglish || '',
      responsiblePerson: company.responsiblePerson || '',
      identityId: company.identityId || '',
      mobile: company.mobile || '',
      email: company.email || '',
      address: company.address || '',
      pumpImageRequired: company.pumpImageRequired || false,
      carImageRequired: company.carImageRequired || false,
      carLimitType: company.carLimitType || 'monthly',
      carLimitCount: company.carLimitCount || 0,
      monthlyCostPerCar: company.monthlyCostPerCar || 0,
      status: company.status || 'pending'
    });

    if (company.logoPath) {
      this.existingLogoUrl = `${this.API_BASE_URL}/image/companies/logos/${company.logoPath}`;
      this.logoPreview.set(this.existingLogoUrl);
      console.log(this.logoPreview());
    }
    if (company.documentsPaths && Array.isArray(company.documentsPaths)) {
      this.existingDocuments = company.documentsPaths.map((doc: any) => ({
        ...doc,
        url: doc.url ? `${this.API_BASE_URL}/image/companies/documents/${doc.url}` : null
      }));
    }
  }

  onLogoSelect(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
    if (!this.validateFile(file, 'logo')) return;

    this.logoFile = file;
    this.logoError = null;

    const reader = new FileReader();
    reader.onload = () => (this.logoPreview.set(reader.result as string));
    reader.readAsDataURL(file);
  }

  onDocumentsSelect(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement)?.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (!this.validateFile(file, 'document')) return;
    }

    this.documentsFiles = [...this.documentsFiles, ...files];
    this.documentsError = null;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.documentsPreview.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  private validateFile(file: File, type: 'logo' | 'document'): boolean {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (type === 'document') {
      allowed.push('application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

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

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview.set(this.existingLogoUrl);
    this.logoError = null;
    const input = document.getElementById('logo-file-input') as HTMLInputElement;
    if (input) input.value = '';
  }

  removeNewDocument(index: number): void {
    this.documentsFiles.splice(index, 1);
    this.documentsPreview.splice(index, 1);
    if (!this.documentsFiles.length) {
      const input = document.getElementById('upload-documents') as HTMLInputElement;
      if (input) input.value = '';
    }
  }

  removeExistingDocument(index: number): void {
    this.existingDocuments.splice(index, 1);
  }

  private prepareFormData(): FormData {
    const fd = new FormData();

    // Append form values
    Object.entries(this.companyForm.value).forEach(([key, value]) => {
      if (key === 'passwordHash' && (!value || value === '')) {
        // Skip empty password
        return;
      }
      fd.append(key, value?.toString() || '');
    });

    // Append logo if new file selected
    if (this.logoFile) {
      fd.append('logo', this.logoFile, this.logoFile.name);
    }

    // Append new documents
    this.documentsFiles.forEach(file => {
      fd.append('documents', file, file.name);
    });

    return fd;
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/customers']);
  }

  async onSubmit(): Promise<void> {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const formData = this.prepareFormData();

    this.companyService.updateCompany(this.companyId, formData).subscribe({
      next: (res: IBaseApiResponse<any>) => {
        this.toster.showSuccess(res.message || 'تم تحديث الشركة بنجاح');
        if (res.statusCode === 200 || res.statusCode === 204) {
          this.router.navigate(['/dashboard/customers']);
        }
      },
      error: (err) => {
        console.error('Update company failed', err);
        this.toster.showError(err?.error?.message || 'فشل تحديث الشركة');
      }
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