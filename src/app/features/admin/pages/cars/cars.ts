import { Component, computed, ElementRef, HostListener, inject, input, Input, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { IPaginationParams } from '../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../core/services/pagination.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Pagination } from "../../../../shared/components/pagination/pagination";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarService } from '../../services/car.service';
import { ICar } from '../../interface/Cars/ICar';
import { ICarFilter } from '../../interface/Cars/ICarFilter';
import { CustomerService } from '../../services/customer.service';
import { IDropdown } from '../../../../core/interfaces/IDropdown';

@Component({
  selector: 'app-cars',
  imports: [Pagination, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cars.html',
  styleUrl: './cars.css'
})
export class CarsComponent {
  @Input() companyId!: string;
  @ViewChild('actionModal') actionModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('companyDropdown') companyDropdown!: ElementRef;
  private destroy$ = new Subject<void>();
  private readonly carService = inject(CarService);
  private toster = inject(ToastService);
  readonly paginationService = inject(PaginationService);
  private customerService = inject(CustomerService);
  public cars = signal<ICar[]>([]);
  public isLoading = signal<boolean>(false);
  public pageSize: number = 15;
  public params: IPaginationParams = {};
  selectedCompany = signal<string>('');
  isCompanyDropdownOpen = signal(false);
  public selectedStatus = signal<string | null>(null);
  public isStatusDropdownOpen = signal<boolean>(false);
  public statusOptions = [
    { value: null, label: 'الكل' },
    { value: 'active', label: 'فعال' },
    { value: 'inactive', label: 'غير فعال' }
  ];
  companyOptions = signal<IDropdown[]>([]); // Store company dropdown options
  totalCars = computed(() => this.cars().length);
  searchControl = new FormControl('');

  ngOnInit() {
    this.getCompanyDropdown();
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(res => {
          this.params.search = this.searchControl.value || undefined;
          this.fetchCars();
        })
      )
      .subscribe();

    this.fetchCars();
  }
  getCompanyDropdown() {
    this.customerService.getCompanyDropdown().pipe(
      tap(res => {
        this.companyOptions.set([{ id: '', name: 'كل الشركات' }, ...res]);
      })
    ).subscribe({
      error: (err) => {
        console.error('Failed to load companies', err);
      }
    });
  }
  getSelectedCompanyLabel(): string {
    const selected = this.companyOptions().find(option => option.id === this.selectedCompany());
    return selected ? selected.name : 'كل الشركات';
  }
  selectCompany(value: string) {
    this.selectedCompany.set(value);
    this.isCompanyDropdownOpen.set(false);
    this.fetchCars();
  }
  toggleCompanyDropdown() {
    this.isCompanyDropdownOpen.set(!this.isCompanyDropdownOpen());
    this.isStatusDropdownOpen.set(false); // Close status dropdown
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

  }

  fetchCars() {
    this.isLoading.set(true);
    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search,
    };
    const carFilter: ICarFilter = {};
    if (this.companyId) {
      carFilter.companyId = this.companyId;
    } else if (this.selectedCompany()) {
      carFilter.companyId = this.selectedCompany();
    }

    this.carService.getAllCars(filterParams, carFilter)
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          this.cars.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({});
  }

  toggleStatusDropdown() {
    this.isStatusDropdownOpen.set(!this.isStatusDropdownOpen());
  }

  selectStatus(status: string | null) {
    this.selectedStatus.set(status);
    this.isStatusDropdownOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchCars();
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
    this.fetchCars(); // Updated
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-[#ecfdf3] text-[#48ba65]';
      case 'inactive':
        return 'bg-red-50 text-red-600'; // Updated for inactive
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'inactive':
        return 'غير فعال';
      default:
        return status;
    }
  }

  getLimitPercentage(car: ICar): number {
    return Math.min((car.limitQty * 0.5), 100);
  }

  toggleCarStatus(car: ICar, event: Event) {
    event.stopPropagation();
    const newStatus = car.status === 'active' ? 'inactive' : 'active';
    const oldStatus = car.status;

    this.isLoading.set(true);

    this.carService.toggleCarStatus(car.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.fetchCars(); // Updated
          this.toster.showSuccess(`تم تحديث حالة السيارة ${car.plateNumber} إلى ${this.getStatusLabel(newStatus)} بنجاح`);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toster.showError('حدث خطأ أثناء تحديث حالة السيارة');
          this.isLoading.set(false);
          console.error('Status update error:', err);
        }
      });
  }

  deleteCar(carId: string, event: Event) {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      this.carService.deleteCar(carId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toster.showSuccess('تم حذف السيارة بنجاح');
            this.fetchCars(); // Updated
          },
          error: (err) => {
            this.toster.showError('حدث خطأ أثناء حذف السيارة');
          }
        });
    }
  }

  exportToExcel() {
    this.carService.exportCarsToExcel() // Updated service method
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toster.showSuccess('تم تصدير بيانات السيارات بنجاح');
        },
        error: () => {
          this.toster.showError('حدث خطأ أثناء تصدير البيانات');
        }
      });
  }

  // Pagination methods
  onPageChange(newPage: number) {
    this.paginationService.goToPage(newPage);
    this.fetchCars(); // Updated
  }

  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchCars(); // Updated
  }

  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchCars(); // Updated
  }

  onSizeChange(newSize: number) {
    this.paginationService.changePageSize(newSize);
    this.fetchCars(); // Updated
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isStatusDropdownOpen() && this.statusDropdown) {
      const clickedInsideStatus = this.statusDropdown.nativeElement.contains(event.target as HTMLElement);
      if (!clickedInsideStatus) {
        this.isStatusDropdownOpen.set(false);
      }
    }
    // Close company dropdown if clicking outside
    if (this.isCompanyDropdownOpen() && this.companyDropdown) {
      const clickedInsideCompany = this.companyDropdown.nativeElement.contains(event.target);
      if (!clickedInsideCompany) {
        this.isCompanyDropdownOpen.set(false);
      }
    }
  }
}