import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../core/interfaces/IBaseApiResponse';
import { CarService } from '../../services/car.service'; // Adjust path as needed
import { ToastService } from '../../../../core/services/toast.service';
import { CustomerService } from '../../services/customer.service';
import { tap } from 'rxjs';
import { IDropdown } from '../../../../core/interfaces/IDropdown';

@Component({
  selector: 'app-create-car',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent],
  templateUrl: './add-car.html',
  styleUrls: ['./add-car.css']
})
export class AddCarComponent implements OnInit {
  carForm: FormGroup;
  private toster = inject(ToastService);
  private customerService = inject(CustomerService);
  CompanyDropdown: IDropdown[] = [];
  driverImagePreview: string | null = null;
  driverImageFile: File | null = null;
  driverImageError: string | null = null;

  controlTypeOptions = [
    { value: 'Monthly', label: 'شهري' },
    { value: 'Weekly', label: 'أسبوعي' },
    { value: 'Daily', label: 'يومي' }
  ];

  monthOptions: { value: string; label: string }[] = [];
  currentMonth = new Date().getMonth() + 1; // 1-12

  weekDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private carService: CarService
  ) {
    this.initializeMonthOptions();
    this.carForm = this.fb.group({
      companyId: ['', [Validators.required]],
      plateNumber: ['', [Validators.required, Validators.minLength(3)]],
      carType: ['', [Validators.required, Validators.minLength(2)]],
      fuelType: ['', [Validators.required]],
      controlType: ['Month', [Validators.required]],
      startDay: [null],
      limitQty: [1, [Validators.required, Validators.min(1)]],
      driverName: ['', [Validators.required, Validators.minLength(3)]],
      driverMobile: ['', [Validators.required, Validators.pattern(/^(\+?\d{10,15})$/)]],
      driverPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.carForm.get('controlType')?.valueChanges.subscribe(value => {
      this.onControlTypeChange(value);
    });
  }

  ngOnInit(): void {
    this.getCompanyDropdown()
  }

  getCompanyDropdown() {
    this.customerService.getCompanyDropdown().pipe(
      tap(res => {
        this.CompanyDropdown = res
      })
    ).subscribe();
  }

  private initializeMonthOptions() {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    for (let i = this.currentMonth; i <= 12; i++) {
      this.monthOptions.push({
        value: i.toString(),
        label: months[i - 1]
      });
    }
  }

  onControlTypeChange(controlType: string) {
    const startDay = this.carForm.get('startDay');
    startDay?.clearValidators();
    startDay?.updateValueAndValidity();

    if (controlType === 'Month') {
      startDay?.setValidators([Validators.required]);
      // Set default to current month
      startDay?.setValue(this.currentMonth.toString());
    } else if (controlType === 'Week') {
      startDay?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
      startDay?.setValue(null);
    } else if (controlType === 'Day') {
      startDay?.clearValidators();
      startDay?.setValue(null);
    }

    startDay?.updateValueAndValidity();
  }

  onDriverImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
    if (!this.validateDriverImage(file)) return;

    this.driverImageFile = file;
    this.driverImageError = null;

    const reader = new FileReader();
    reader.onload = () => (this.driverImagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  private validateDriverImage(file: File): boolean {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      this.driverImageError = 'حجم الملف يجب أن يكون أقل من 2 ميغابايت';
      return false;
    }
    if (!allowed.includes(file.type)) {
      this.driverImageError = 'نوع الملف غير مدعوم';
      return false;
    }
    return true;
  }

  removeDriverImage() {
    this.driverImageFile = null;
    this.driverImagePreview = null;
    this.driverImageError = null;
    (document.getElementById('upload-driver-image') as HTMLInputElement).value = '';
  }

  private prepareFormData(): FormData {
    const fd = new FormData();
    Object.entries(this.carForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        fd.append(key, value.toString());
      }
    });
    if (this.driverImageFile) {
      fd.append('driverImageUrl', this.driverImageFile, this.driverImageFile.name);
    }
    return fd;
  }

  onCancel() {
    this.router.navigate(['/admin/cars']); // Adjust route as needed
  }

  onSubmit() {
    if (this.carForm.invalid) return this.carForm.markAllAsTouched();
    const formData = this.prepareFormData();
    this.carService.createCar(formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message);
        if (res.statusCode === 200) this.router.navigate(['/admin/cars']);
        else this.toster.showError(res.message);
        ;
      },
    });
  }

  // Getters
  get companyId() { return this.carForm.get('companyId'); }
  get plateNumber() { return this.carForm.get('plateNumber'); }
  get carType() { return this.carForm.get('carType'); }
  get fuelType() { return this.carForm.get('fuelType'); }
  get controlType() { return this.carForm.get('controlType'); }
  get startDay() { return this.carForm.get('startDay'); }
  get limitQty() { return this.carForm.get('limitQty'); }
  get driverName() { return this.carForm.get('driverName'); }
  get driverMobile() { return this.carForm.get('driverMobile'); }
  get driverPassword() { return this.carForm.get('driverPassword'); }
}