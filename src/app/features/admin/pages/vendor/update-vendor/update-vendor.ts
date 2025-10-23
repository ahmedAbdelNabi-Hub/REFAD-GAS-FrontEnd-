import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { VendorService } from '../../../services/vendor.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { IVendor } from '../../../interface/Vendor/IVendor';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-edit-vendor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent, RouterLink],
  templateUrl: './update-vendor.html',
  styleUrls: ['./update-vendor.css']
})
export class UpdateVendor implements OnInit {
  vendorForm: FormGroup;
  private toster = inject(ToastService);
  private vendorService = inject(VendorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  logoPreview: string | null = null;
  vendorId: string | null = null;

  constructor() {
    this.vendorForm = this.fb.group({
      vendorCode: ['', [Validators.required, Validators.minLength(3)]],
      vendorNameAr: ['', [Validators.required, Validators.minLength(3)]],
      vendorNameEn: ['', [Validators.required, Validators.minLength(3)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^(\+?\d{10,15})$/)]],
      headquartersAddress: ['', [Validators.required, Validators.minLength(5)]],
      logo: ['', [Validators.pattern(/\.(jpg|jpeg|png|gif)$/i)]]
    });
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          this.vendorId = params.get('id');
          if (!this.vendorId) throw new Error('Vendor ID is required');
          return this.vendorService.getVendorById(this.vendorId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (vendor: IVendor) => {
          this.vendorForm.patchValue({
            vendorCode: vendor.vendorCode,
            vendorNameAr: vendor.vendorNameAr,
            vendorNameEn: vendor.vendorNameEn,
            contactEmail: vendor.contactEmail,
            contactPhone: vendor.contactPhone,
            headquartersAddress: vendor.headquartersAddress,
            logo: vendor.logo
          });
          this.logoPreview = vendor.logo || null;
        },

      });

    this.vendorForm.get('logo')?.valueChanges.subscribe(value => {
      this.logoPreview = value && this.isValidImageUrl(value) ? value : null;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isValidImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  removeLogo() {
    this.vendorForm.get('logo')?.setValue('');
    this.logoPreview = null;
  }



  onCancel() {
    this.router.navigate(['/admin/vendors']);
  }

  onSubmit() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }
    if (!this.vendorId) {
      this.toster.showError('معرف المورد غير موجود');
      return;
    }
    const formData = this.vendorForm.value;
    this.vendorService.updateVendor(this.vendorId, formData).subscribe({
      next: (res: IBaseApiResponse<any>) => {
        this.toster.showSuccess(res.message || 'تم تحديث المورد بنجاح');
        if (res.statusCode === 200) {
          this.router.navigate(['/admin/vendors']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ أثناء تحديث المورد');
        }
      },
      error: (err) => {
        this.toster.showError(err.error.message);
        console.error('Update vendor error:', err);
      }
    });
  }

  get vendorNameAr() { return this.vendorForm.get('vendorNameAr'); }
  get vendorNameEn() { return this.vendorForm.get('vendorNameEn'); }
  get vendorCode() { return this.vendorForm.get('vendorCode'); }

  get contactEmail() { return this.vendorForm.get('contactEmail'); }
  get contactPhone() { return this.vendorForm.get('contactPhone'); }
  get headquartersAddress() { return this.vendorForm.get('headquartersAddress'); }
  get logo() { return this.vendorForm.get('logo'); }
}