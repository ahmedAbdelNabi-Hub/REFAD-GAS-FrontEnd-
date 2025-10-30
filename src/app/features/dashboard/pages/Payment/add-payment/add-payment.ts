import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../../shared/components/form-error/form-error.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { PaymentService } from '../../../services/payment.service';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { CustomerService } from '../../../services/customer.service';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-add-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent, RouterLink],
  templateUrl: './add-payment.html',
  styleUrls: ['./add-payment.css']
})
export class AddPaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  private toster = inject(ToastService);
  private paymentService = inject(PaymentService);
  private readonly customerService = inject(CustomerService);
  private readonly auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  companies: IDropdown[] = [];

  get isCompanyUser(): boolean {
    return this.auth.isCompany();
  }
  get userCompanyId(): string {
    return this.auth.UserId()!;
  }

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCompanies();
    if (this.isCompanyUser && this.userCompanyId) {
      this.paymentForm.patchValue({ companyId: this.userCompanyId });
      this.paymentForm.get('companyId')?.disable();
    }
  }

  private initializeForm(): void {
    const companyIdControl = this.isCompanyUser
      ? [this.userCompanyId, []]
      : ['', Validators.required];

    this.paymentForm = this.fb.group({
      companyId: companyIdControl,
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentType: ['Transfer', Validators.required],
      serviceType: ['Fuel', Validators.required],
      description: ['', Validators.required],
      referenceNumber: ['']
    });
  }

  loadCompanies() {
    if (!this.isCompanyUser) {
      this.customerService.getCompanyDropdown().subscribe({
        next: (companies) => {
          this.companies = companies;
          if (!this.isCompanyUser && companies.length > 0 && !this.paymentForm.get('companyId')?.value) {
          }
        },
        error: () => this.toster.showError('فشل تحميل الشركات')
      });
    }
  }

  onSubmit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const formData = this.paymentForm.getRawValue();
    this.paymentService.createPayment(formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message || 'تمت الإضافة بنجاح');
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.router.navigate(['/dashboard/payments']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ');
        }
      },
      error: (err) => {
        console.error('Create payment failed', err);
        this.toster.showError(err.error?.message || 'فشل إضافة الدفعة');
      }
    });
  }

  get companyId() { return this.paymentForm.get('companyId'); }
  get amount() { return this.paymentForm.get('amount'); }
  get paymentType() { return this.paymentForm.get('paymentType'); }
  get serviceType() { return this.paymentForm.get('serviceType'); }
  get description() { return this.paymentForm.get('description'); }
  get referenceNumber() { return this.paymentForm.get('referenceNumber'); }


}