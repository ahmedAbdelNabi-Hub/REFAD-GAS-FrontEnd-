import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { VendorService } from '../../../services/vendor.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { StationService } from '../../../services/station.service';
import { LocationPicker } from "../../../../../shared/components/location-picker/location-picker";

@Component({
  selector: 'app-add-station',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent, LocationPicker],
  templateUrl: './add-station.html',
  styleUrls: ['./add-station.css']
})
export class AddStationComponent implements OnInit {
  stationForm: FormGroup;
  private toster = inject(ToastService);
  private vendorService = inject(VendorService);
  private stationService = inject(StationService);

  // Signal for typed coordinates
  typedCoords = signal<{ lat: number; lng: number } | null>(null);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  vendors: IDropdown[] = [];

  constructor() {
    this.stationForm = this.fb.group({
      stationId: ['', [Validators.required, Validators.minLength(3)]],
      vendorId: ['', [Validators.required]],
      stationNameAr: ['', [Validators.required, Validators.minLength(3)]],
      stationNameEn: ['', [Validators.required, Validators.minLength(3)]],
      locationLat: ['', [Validators.required, Validators.pattern(/^-?\d*(\.\d+)?$/)]],
      locationLng: ['', [Validators.required, Validators.pattern(/^-?\d*(\.\d+)?$/)]]
    });
  }

  ngOnInit() {
    this.fetchVendors();

    const latControl = this.stationForm.get('locationLat')!;
    const lngControl = this.stationForm.get('locationLng')!;

    // Watch lat changes
    latControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((lat) => {
        const lng = lngControl.value;
        if (this.isValidNumber(lat) && this.isValidNumber(lng)) {
          this.typedCoords.set({ lat: parseFloat(lat), lng: parseFloat(lng) });
          console.log('Typed coords updated (lat):', this.typedCoords());
        }
      });

    // Watch lng changes
    lngControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((lng) => {
        const lat = latControl.value;
        if (this.isValidNumber(lat) && this.isValidNumber(lng)) {
          this.typedCoords.set({ lat: parseFloat(lat), lng: parseFloat(lng) });
          console.log('Typed coords updated (lng):', this.typedCoords());
        }
      });
  }

  private isValidNumber(value: any): boolean {
    return value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchVendors() {
    this.vendorService.getVendorDropdown()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.vendors = res;
        },
        error: (err) => {
          this.toster.showError('حدث خطأ أثناء جلب الموردين');
          console.error('Fetch vendors error:', err);
        }
      });
  }

  private prepareFormData(): FormData {
    const fd = new FormData();
    Object.entries(this.stationForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        fd.append(key, value.toString());
      }
    });
    return fd;
  }

  onCancel() {
    this.router.navigate(['/admin/stations']);
  }

  onSubmit() {
    if (this.stationForm.invalid) {
      this.stationForm.markAllAsTouched();
      return;
    }
    const formData = this.stationForm.value;
    this.stationService.createStation(formData).subscribe({
      next: (res: IBaseApiResponse<number>) => {
        this.toster.showSuccess(res.message || 'تم إضافة المحطة بنجاح');
        if (res.statusCode === 200) {
          this.router.navigate(['/admin/stations']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ أثناء إضافة المحطة');
        }
      },
      error: (err) => {
        this.toster.showError('حدث خطأ أثناء إضافة المحطة');
        console.error('Create station error:', err);
      }
    });
  }

  onLocationSelected(coords: { lat: number; lng: number }) {
    console.log('Location selected from map:', coords);
    this.stationForm.patchValue({
      locationLat: coords.lat.toFixed(6),
      locationLng: coords.lng.toFixed(6)
    });
  }

  // Getters
  get vendorId() { return this.stationForm.get('vendorId'); }
  get stationNameAr() { return this.stationForm.get('stationNameAr'); }
  get stationNameEn() { return this.stationForm.get('stationNameEn'); }
  get locationLat() { return this.stationForm.get('locationLat'); }
  get stationCode() { return this.stationForm.get('stationId'); }
  get locationLng() { return this.stationForm.get('locationLng'); }
}