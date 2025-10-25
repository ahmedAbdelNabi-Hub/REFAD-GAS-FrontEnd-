import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../../shared/components/form-error/form-error.component';
import { IBaseApiResponse } from '../../../../../core/interfaces/IBaseApiResponse';
import { VendorService } from '../../../services/vendor.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { IStation } from '../../../interface/Stations/IStation';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocationPicker } from '../../../../../shared/components/location-picker/location-picker';
import { StationService } from '../../../services/station.service';

@Component({
  selector: 'app-edit-station',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent, RouterLink, LocationPicker],
  templateUrl: './update-station.html',
  styleUrls: ['./update-station.css']
})
export class EditStationComponent implements OnInit {
  stationForm: FormGroup;
  private toster = inject(ToastService);
  private vendorService = inject(VendorService);
  private stationService = inject(StationService);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  vendors: IDropdown[] = [];
  typedCoords = signal<{ lat: number; lng: number } | null>(null);
  stationId: string | null = null;

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
    this.route.paramMap
      .pipe(
        switchMap(params => {
          this.stationId = params.get('id');
          if (!this.stationId) throw new Error('Station ID is required');
          return this.stationService.getStationById(this.stationId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (station: IStation) => {
          this.stationForm.patchValue({
            stationId: station.stationId,
            vendorId: station.vendorId,
            stationNameAr: station.stationNameAr,
            stationNameEn: station.stationNameEn,
            locationLat: station.locationLat.toFixed(6),
            locationLng: station.locationLng.toFixed(6)
          });
          this.typedCoords.set({ lat: station.locationLat, lng: station.locationLng });
        },
     
      });

    // Watch lat changes
    const latControl = this.stationForm.get('locationLat')!;
    latControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((lat) => {
        const lng = this.stationForm.get('locationLng')!.value;
        if (this.isValidNumber(lat) && this.isValidNumber(lng)) {
          this.typedCoords.set({ lat: parseFloat(lat), lng: parseFloat(lng) });
          console.log('Typed coords updated (lat):', this.typedCoords());
        }
      });

    const lngControl = this.stationForm.get('locationLng')!;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isValidNumber(value: any): boolean {
    return value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value));
  }

  fetchVendors() {
    this.vendorService.getVendorDropdown()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.vendors = res;
        },
    
      });
  }

  onCancel() {
    this.router.navigate(['/admin/stations']);
  }

  onSubmit() {
    if (this.stationForm.invalid) {
      this.stationForm.markAllAsTouched();
      return;
    }
    if (!this.stationId) {
      this.toster.showError('معرف المحطة غير موجود');
      return;
    }
    const formData = this.stationForm.value;
    this.stationService.updateStation(this.stationId, formData).subscribe({
      next: (res: IBaseApiResponse<any>) => {
        this.toster.showSuccess(res.message || 'تم تحديث المحطة بنجاح');
        if (res.statusCode === 200) {
          this.router.navigate(['/admin/stations']);
        } else {
          this.toster.showError(res.message || 'حدث خطأ أثناء تحديث المحطة');
        }
      },
      error: (err) => {
        this.toster.showError('حدث خطأ أثناء تحديث المحطة');
        console.error('Update station error:', err);
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
  get stationCode() { return this.stationForm.get('stationId'); }
  get stationNameAr() { return this.stationForm.get('stationNameAr'); }
  get stationNameEn() { return this.stationForm.get('stationNameEn'); }
  get locationLat() { return this.stationForm.get('locationLat'); }
  get locationLng() { return this.stationForm.get('locationLng'); }
}