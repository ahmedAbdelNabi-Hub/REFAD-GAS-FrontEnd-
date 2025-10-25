import { Component, computed, ElementRef, inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { RouterLink } from "@angular/router";
import { debounceTime, distinctUntilChanged, skip, Subject, takeUntil, tap } from 'rxjs';
import { PaginationService } from '../../../../core/services/pagination.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CustomerService } from '../../services/customer.service';
import { ICompany } from '../../interface/Company/ICompany ';
import { IPaginationParams } from '../../../../core/interfaces/IPaginationParams';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ICompanyFilter } from '../../interface/Company/ICompanyFilter';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Pagination } from "../../../../shared/components/pagination/pagination";

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, Pagination],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent {
  @ViewChild('actionModal') actionModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private readonly customerService = inject(CustomerService);
  private toster = inject(ToastService);
  readonly paginationService = inject(PaginationService);
  private CustomerId = signal<string | null>(null);

  public customers = signal<ICompany[]>([]);
  public isLoading = signal<boolean>(false);
  public pageSize: number = 15;
  public params: IPaginationParams = {};

  // Filter states
  public selectedStatus = signal<string | null>(null);
  public isStatusDropdownOpen = signal<boolean>(false);
  public statusOptions = [
    { value: null, label: 'الكل' },
    { value: 'active', label: 'فعال' },
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'suspended', label: 'معلق' }
  ];

  totalCustomers = computed(() => this.customers().length);
  searchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        skip(1),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(res => {
          this.params.search = this.searchControl.value || undefined;
          this.fetchCompanies();
        })
      )
      .subscribe();

    if (isPlatformBrowser(this.platformId)) {
      this.fetchCompanies();
    }
  }


  private platformId = inject(PLATFORM_ID);

  fetchCompanies() {
    this.isLoading.set(true);
    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search,
    };

    const companyFilter: ICompanyFilter = {};

    if (this.selectedStatus()) {
      companyFilter.status = this.selectedStatus() as 'active' | 'pending' | 'suspended';
    }

    this.customerService.getAllCompanies(filterParams, companyFilter)
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          console.log('Fetch triggered', new Date().toISOString());
          this.customers.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({
        error: (err) => {
          this.isLoading.set(false);
          this.toster.showError('حدث خطأ أثناء جلب البيانات');
        }
      });
  }

  // Status filter methods
  toggleStatusDropdown() {
    this.isStatusDropdownOpen.set(!this.isStatusDropdownOpen());
  }

  selectStatus(status: string | null) {
    this.selectedStatus.set(status);
    this.isStatusDropdownOpen.set(false);
    this.paginationService.goToPage(1); // Reset to first page
    this.fetchCompanies();
  }

  getSelectedStatusLabel(): string {
    const selected = this.statusOptions.find(opt => opt.value === this.selectedStatus());
    return selected ? selected.label : 'الحالة';
  }

  // Reset filters
  resetFilters() {
    this.selectedStatus.set(null);
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.paginationService.goToPage(1);
    this.fetchCompanies();
  }

  // Status badge helper
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-[#ecfdf3] text-[#48ba65]';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600';
      case 'suspended':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'pending':
        return 'قيد الانتظار';
      case 'suspended':
        return 'معلق';
      default:
        return status;
    }
  }

  getCarLimitPercentage(company: ICompany): number {
    return 50;
  }

  toggleCustomerStatus(customer: ICompany, event: Event) {
    event.stopPropagation();

    const newStatus = customer.status === 'active' ? 'suspended' : 'active';
    const oldStatus = customer.status;

    this.isLoading.set(true);

    this.customerService.toggleCompanyStatus(customer.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.fetchCompanies();
          this.toster.showSuccess(`تم تحديث حالة العميل ${customer.companyNameArabic} إلى ${this.getStatusLabel(newStatus)} بنجاح`);
          this.isLoading.set(false);
        },
        error: (err) => {
          // const revertedCustomers = this.customers().map(c =>
          //   c.id === customer.id ? { ...c, status: oldStatus } : c
          // );
          // this.customers.set(revertedCustomers);
          this.toster.showError('حدث خطأ أثناء تحديث الحالة');
          this.isLoading.set(false);
          console.error('Status update error:', err);
        }
      });
  }

  deleteCustomer(customerId: string, event: Event) {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      this.toster.showSuccess('تم حذف العميل بنجاح');
      this.fetchCompanies();
    }
  }

  exportToExcel() {
    this.toster.showSuccess('جاري تصدير البيانات...');
  }

  // Pagination methods
  onPageChange(newPage: number) {
    this.paginationService.goToPage(newPage);
    this.fetchCompanies();
  }

  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchCompanies();
  }

  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchCompanies();
  }

  onSizeChange(newSize: number) {
    this.paginationService.changePageSize(newSize);
    this.fetchCompanies();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

  }
}