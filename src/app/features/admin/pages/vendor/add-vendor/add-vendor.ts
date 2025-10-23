import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { VendorService } from '../../../services/vendor.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent, RouterLink],
  templateUrl: './add-vendor.html',
  styleUrls: ['./add-vendor.css']
})
export class AddVendorComponent {
  vendorForm: FormGroup;
  private toster = inject(ToastService);
  private vendorService = inject(VendorService);
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.vendorForm = this.fb.group({
      vendorNameAr: ['', [Validators.required, Validators.minLength(3)]],
      vendorCode: ['', [Validators.required, Validators.minLength(3)]],
      vendorNameEn: ['', [Validators.required, Validators.minLength(3)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^(\+?\d{10,15})$/)]],
      headquartersAddress: ['', [Validators.required, Validators.minLength(5)]],
      logo: ['', [Validators.pattern(/\.(jpg|jpeg|png|gif)$/i)]]
    });

    this.vendorForm.get('logo')?.valueChanges.subscribe(value => {
      this.logoPreview = value && this.isValidImageUrl(value) ? value : null;
    });
  }

  private isValidImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  removeLogo() {
    this.vendorForm.get('logo')?.setValue('');
    this.logoPreview = null;
  }

  // private prepareFormData(): FormData {
  //   // const fd = new FormData();
  //   // Object.entries(this.vendorForm.value).forEach(([key, value]) => {
  //   //   if (value !== null && value !== undefined && value !== '') {
  //   //     fd.append(key, value.toString());
  //   //   }
  //   // });
  //   // return fd;
  // }

  onCancel() {
    this.router.navigate(['/admin/vendors']);
  }

  onSubmit() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }
    const formData = this.vendorForm.value;
    this.vendorService.createVendor(formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message || 'تم إضافة المورد بنجاح');
        if (res.statusCode === 200) {
          this.router.navigate(['/admin/vendors']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ أثناء إضافة المورد');
        }
      },
      error: (err) => {
        this.toster.showError('حدث خطأ أثناء إضافة المورد');
        console.error('Create vendor error:', err);
      }
    });
  }

  // Getters
  get vendorNameAr() { return this.vendorForm.get('vendorNameAr'); }
  get vendorNameEn() { return this.vendorForm.get('vendorNameEn'); }
  get contactEmail() { return this.vendorForm.get('contactEmail'); }
  get contactPhone() { return this.vendorForm.get('contactPhone'); }
  get headquartersAddress() { return this.vendorForm.get('headquartersAddress'); }
  get vendorCode() { return this.vendorForm.get('vendorCode'); }

  get logo() { return this.vendorForm.get('logo'); }
}