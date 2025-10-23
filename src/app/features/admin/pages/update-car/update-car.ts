import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../core/interfaces/IBaseApiResponse';
import { CarService } from '../../services/car.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CustomerService } from '../../services/customer.service';
import { tap } from 'rxjs';
import { IDropdown } from '../../../../core/interfaces/IDropdown';
import { ICar } from '../../interface/Cars/ICar';

@Component({
  selector: 'app-update-car',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent],
  templateUrl: './update-car.html',
  styleUrls: ['./update-car.css']
})
export class UpdateCarComponent implements OnInit {
  private readonly API_BASE_URL = 'https://localhost:7069';
  carForm: FormGroup;
  private toster = inject(ToastService);
  private route = inject(ActivatedRoute);
  private carService = inject(CarService);
  private customerService = inject(CustomerService);

  carId: string = this.route.snapshot.paramMap.get('id') as string;
  isLoading: boolean = true;
  CompanyDropdown: IDropdown[] = [];
  driverImagePreview = signal<string | null>(null);
  driverImageFile: File | null = null;
  existingDriverImageUrl: string | null = null;
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
    private router: Router
  ) {
    this.initializeMonthOptions();
    this.carForm = this.fb.group({
      companyId: ['', [Validators.required]],
      plateNumber: ['', [Validators.required, Validators.minLength(3)]],
      carType: ['', [Validators.required, Validators.minLength(2)]],
      fuelType: ['', [Validators.required]],
      controlType: ['Monthly', [Validators.required]],
      startDay: [null],
      limitQty: [1, [Validators.required, Validators.min(1)]],
      driverName: ['', [Validators.required, Validators.minLength(3)]],
      driverMobile: ['', [Validators.required, Validators.pattern(/^(\+?\d{10,15})$/)]],
      driverPassword: [''] // Optional for update
    });

    this.carForm.get('controlType')?.valueChanges.subscribe(value => {
      this.onControlTypeChange(value);
    });

  }

  ngOnInit(): void {
    this.loadCarData();
    this.getCompanyDropdown();

  }

  getCompanyDropdown() {
    this.customerService.getCompanyDropdown().pipe(
      tap(res => {
        this.CompanyDropdown = res;
      })
    ).subscribe();
  }

  private initializeMonthOptions() {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    for (let i = 1; i <= 12; i++) {
      this.monthOptions.push({
        value: i.toString(),
        label: months[i - 1]
      });
    }
  }

  loadCarData(): void {
    this.isLoading = true;
    this.carService.getCarById(this.carId).pipe(
      tap(res => {
        const car = res || res;
        console.log('Car data:', car);
        this.patchFormValues(car);
        this.isLoading = false;
      })
    ).subscribe({

    });
  }

  patchFormValues(car: ICar): void {
    this.carForm.patchValue({
      companyId: car.companyId.toLowerCase() || '',
      plateNumber: car.plateNumber || '',
      carType: car.carType || '',
      fuelType: car.fuelType || '',
      controlType: car.controlType || 'Monthly',
      startDay: car.startDay || null,
      limitQty: car.limitQty || 1,
      driverName: car.driverName || '',
      driverMobile: car.driverMobile || '',
      driverPassword: ''
    });

    if (car.driverImageUrl) {
      this.existingDriverImageUrl = `${this.API_BASE_URL}/image/driver/${car.driverImageUrl}`;
      this.driverImagePreview.set(this.existingDriverImageUrl);
    }
  }

  onControlTypeChange(controlType: string) {
    const startDay = this.carForm.get('startDay');
    startDay?.clearValidators();
    startDay?.updateValueAndValidity();

    if (controlType === 'Monthly') {
      startDay?.setValidators([Validators.required]);
      startDay?.setValue(this.carForm.get('startDay')?.value || this.currentMonth.toString());
    } else if (controlType === 'Weekly') {
      startDay?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
      startDay?.setValue(this.carForm.get('startDay')?.value || null);
    } else if (controlType === 'Daily') {
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
    reader.onload = () => this.driverImagePreview.set(reader.result as string);
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
    this.driverImagePreview.set(this.existingDriverImageUrl);
    this.driverImageError = null;
    const input = document.getElementById('upload-driver-image') as HTMLInputElement;
    if (input) input.value = '';
  }

  private prepareFormData(): FormData {
    const fd = new FormData();
    Object.entries(this.carForm.value).forEach(([key, value]) => {
      if (key === 'driverPassword' && (!value || value === '')) {
        return; // Skip empty password
      }
      if (value !== null && value !== undefined) {
        fd.append(key, value.toString());
      }
    });
    if (this.driverImageFile) {
      fd.append('driverImageFile', this.driverImageFile, this.driverImageFile.name);
    }
    return fd;
  }

  onCancel(): void {
    this.router.navigate(['/admin/cars']);
  }

  onSubmit(): void {
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }

    const formData = this.prepareFormData();
    this.carService.updateCar(this.carId, formData).subscribe({
      next: (res: IBaseApiResponse<any>) => {
        this.toster.showSuccess(res.message || 'تم تحديث السيارة بنجاح');
        if (res.statusCode === 200 || res.statusCode === 204) {
          this.router.navigate(['/admin/cars']);
        }
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