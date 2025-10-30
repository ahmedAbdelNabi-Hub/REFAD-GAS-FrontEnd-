import { Component, ElementRef, inject, OnDestroy, OnInit, signal, computed, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { IPaginationParams } from '../../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../../core/services/pagination.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { FuelRequestService } from '../../../services/fuel-request.service';
import { IFuelRequestBasic } from '../../../interface/FuelRequest/IFuelRequestBasic';
import { IFuelRequestFilter } from '../../../interface/FuelRequest/IFuelRequestFilter';
import { Pagination } from '../../../../../shared/components/pagination/pagination';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DropdownComponent } from '../../../../../shared/components/dropdown-component/dropdown-component';
import { FuelSummaryComponent } from './components/Fuel-Summary/fuel-summary';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-fuels',
  standalone: true,
  imports: [
    Pagination,
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FuelSummaryComponent,
    DropdownComponent
  ],
  templateUrl: './fuels.html',
  styleUrl: './fuels.css'
})
export class Fuels implements OnInit, OnDestroy {
  @ViewChild('actionModal') actionModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;

  // Services
  private destroy$ = new Subject<void>();
  private readonly fuelService = inject(FuelRequestService);
  private toster = inject(ToastService);
  private auth = inject(AuthService);
  public readonly paginationService = inject(PaginationService);


  public fuelRequests = signal<IFuelRequestBasic[]>([]);
  public isLoading = signal<boolean>(false);
  public params: IPaginationParams = {};

  public selectedStatus = signal<'pending' | 'approved' | 'declined' | null>(null);
  public isStatusOpen = signal(false);
  public FuelId: string = '';


  get isCompanyUser(): boolean {
    return this.auth.isCompany(); // boolean
  }
  get userCompanyId(): string {
    return this.auth.UserId()!;
  }

  public statusOptions = [
    { value: null, label: 'اختار الحالة' },
    { value: 'pending', label: 'معلق' },
    { value: 'approved', label: 'موافق' },
    { value: 'declined', label: 'مرفوض' }
  ];

  statusOptionss: IDropdown[] = [
    { id: 'approved', name: 'الموافقة', icon: 'bx bx-check-circle text-green-600' },
    { id: 'pending', name: 'الانتظار', icon: 'bx bx-time text-yellow-600' },
    { id: 'declined', name: 'مرفوض', icon: 'bx bx-x-circle text-red-600' }
  ];

  searchControl = new FormControl('');

  ngOnInit() {
    this.setupSearch();
    this.fetchFuelRequests();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.paginationService.goToPage(1);
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(value => {
          this.params.search = value?.trim() || undefined;
          this.paginationService.goToPage(1);
          this.fetchFuelRequests();
        })
      )
      .subscribe();
  }

  // Fetch with company filter
  fetchFuelRequests() {
    this.isLoading.set(true);

    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search
    };

    const filter: IFuelRequestFilter = {};

    // Auto-filter by company if user is company
    if (this.isCompanyUser && this.userCompanyId) {
      filter.companyId = this.userCompanyId;
    }

    if (this.selectedStatus()) {
      filter.status = this.selectedStatus()!;
    }

    this.fuelService.getAllFuels(filterParams, filter)
      .pipe(
        takeUntil(this.destroy$),
        tap(res => {
          this.fuelRequests.set(res.data ?? []);
          this.paginationService.updateTotalItems(res.count ?? 0);
          this.isLoading.set(false);
        })
      )
      .subscribe();
  }

  // Status update
  onStatusSelected(requestId: string, newStatus: string): void {
    this.isUpdating.set(true);
    this.fuelService.updateFuelStatus(requestId, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toster.showSuccess('تم تحديث حالة طلب الوقود بنجاح');
          this.isUpdating.set(false);
          this.fetchFuelRequests();
        })
      )
      .subscribe();
  }

  // Modal
  showModal(id: string) {
    this.FuelId = id;
    this.actionModal.nativeElement.showModal();
  }

  closeModal() {
    this.actionModal.nativeElement.close();
  }

  public deleteFuelRequest() {
    this.fuelService.deleteFuelRequest(this.FuelId)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.fuelRequests.set(this.fuelRequests().filter(req => req.id !== this.FuelId));
          this.toster.showSuccess('تم حذف طلب الوقود بنجاح');
          this.closeModal();
          this.paginationService.updateTotalItems(this.paginationService.totalItems() - 1);
        })
      )
      .subscribe();
  }

  // Dropdowns
  toggleStatus() {
    this.isStatusOpen.set(!this.isStatusOpen());
    this.closeOthers('status');
  }

  private closeOthers(except: 'status') {
    if (except !== 'status') this.isStatusOpen.set(false);
  }

  selectStatus(status: any) {
    this.selectedStatus.set(status);
    this.isStatusOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchFuelRequests();
  }

  getStatusLabel() {
    const s = this.statusOptions.find(x => x.value === this.selectedStatus());
    return s ? s.label : 'الحالة';
  }

  resetFilters() {
    this.selectedStatus.set(null);
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.paginationService.goToPage(1);
    this.fetchFuelRequests();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('ar');
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  onPageChange(page: number) {
    this.paginationService.goToPage(page);
    this.fetchFuelRequests();
  }
  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchFuelRequests();
  }
  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchFuelRequests();
  }
  onSizeChange(size: number) {
    this.paginationService.changePageSize(size);
    this.fetchFuelRequests();
  }

  public isUpdating = signal(false);
}