import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, tap } from 'rxjs';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IPaginationParams } from '../../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../../core/services/pagination.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { Pagination } from '../../../../../shared/components/pagination/pagination';
import { IVendor } from '../../../interface/Vendor/IVendor';
import { IVendorFilter } from '../../../interface/Vendor/IVendorFilter';
import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, Pagination],
  templateUrl: './vendors.html',
  styleUrls: ['./vendors.css']
})
export class VendorsComponent {
  @ViewChild('actionModal') actionModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private readonly vendorService = inject(VendorService);
  private toster = inject(ToastService);
  private VendorId = signal<string | null>(null);

  public readonly paginationService = inject(PaginationService);
  public vendors = signal<IVendor[]>([]);
  public isLoading = signal<boolean>(false);
  public pageSize: number = 15;
  public params: IPaginationParams = {};

  public selectedStatus = signal<boolean | null>(null);
  public isStatusDropdownOpen = signal<boolean>(false);
  public statusOptions = [
    { value: null, label: 'الكل' },
    { value: true, label: 'فعال' },
    { value: false, label: 'غير فعال' }
  ];

  totalVendors = computed(() => this.vendors().length);
  searchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(res => {
          this.params.search = this.searchControl.value || undefined;
          this.fetchVendors();
        })
      )
      .subscribe();
    this.fetchVendors();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

  }

  fetchVendors() {
    this.isLoading.set(true);
    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search,
    };

    const vendorFilter: IVendorFilter = {};
    if (this.selectedStatus() !== null) {
      vendorFilter.status = this.selectedStatus()!;
    }

    this.vendorService.getAllVendors(filterParams, vendorFilter)
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          this.vendors.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({
        error: (err) => {
          this.isLoading.set(false);
          this.toster.showError('حدث خطأ أثناء جلب البيانات');
          console.error('Fetch vendors error:', err);
        }
      });
  }

  toggleStatusDropdown() {
    this.isStatusDropdownOpen.set(!this.isStatusDropdownOpen());
  }

  selectStatus(status: boolean | null) {
    this.selectedStatus.set(status);
    this.isStatusDropdownOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchVendors();
  }

  getSelectedStatusLabel(): string {
    const selected = this.statusOptions.find(opt => opt.value === this.selectedStatus());
    return selected ? selected.label : 'الحالة';
  }
  resetFilters() {
    this.selectedStatus.set(null);
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.paginationService.goToPage(1);
    this.fetchVendors();
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-[#ecfdf3] text-[#48ba65]' : 'bg-red-50 text-red-600';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'فعال' : 'غير فعال';
  }

  toggleVendorStatus(vendor: IVendor, event: Event) {
    event.stopPropagation();
    const newStatus = !vendor.isActive;
    const oldStatus = vendor.isActive;
    this.isLoading.set(true);
    this.vendorService.toggleVendorStatus(vendor.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.fetchVendors();
          this.toster.showSuccess(`تم تحديث حالة المورد ${vendor.vendorNameAr} إلى ${this.getStatusLabel(newStatus)} بنجاح`);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toster.showError('حدث خطأ أثناء تحديث الحالة');
          this.isLoading.set(false);
          console.error('Status update error:', err);
        }
      });
  }

  deleteVendor(vendorId: string, event: Event) {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      this.vendorService.deleteCompany(vendorId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toster.showSuccess('تم حذف المورد بنجاح');
            this.fetchVendors();
          },
        });
    }
  }

  exportToExcel() {
    this.toster.showSuccess('جاري تصدير البيانات...');
  }

  // Pagination methods
  onPageChange(newPage: number) {
    this.paginationService.goToPage(newPage);
    this.fetchVendors();
  }

  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchVendors();
  }

  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchVendors();
  }

  onSizeChange(newSize: number) {
    this.paginationService.changePageSize(newSize);
    this.fetchVendors();
  }
}