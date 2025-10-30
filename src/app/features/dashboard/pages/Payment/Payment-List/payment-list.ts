import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil,
  tap
} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IPaginationParams } from '../../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../../core/services/pagination.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { Pagination } from '../../../../../shared/components/pagination/pagination';
import { PaymentService } from '../../../services/payment.service';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { CustomerService } from '../../../services/customer.service';
import { IPayment } from '../../../interface/Payments/IPayment';
import { IPaymentFilter } from '../../../interface/Payments/IPaymentFilter';
import { DropdownComponent } from '../../../../../shared/components/dropdown-component/dropdown-component';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    Pagination,
    DropdownComponent
  ],
  templateUrl: './payment-list.html',
  styleUrls: ['./payment-list.css']
})
export class PaymentListComponent implements OnInit, OnDestroy {
  /* --------------------------------------------------------------------- */
  /*  ViewChildren – for click-outside handling (optional, keep if you use) */
  /* --------------------------------------------------------------------- */
  @ViewChild('companyDropdown') companyDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('paymentTypeDropdown') paymentTypeDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('serviceTypeDropdown') serviceTypeDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;

  /* -------------------------- Services & Signals ----------------------- */
  private destroy$ = new Subject<void>();
  private readonly paymentService = inject(PaymentService);
  private readonly companyService = inject(CustomerService);
  private readonly auth = inject(AuthService);
  private toster = inject(ToastService);
  public readonly paginationService = inject(PaginationService);

  public payments = signal<IPayment[]>([]);
  public isLoading = signal<boolean>(false);
  public pageSize = 15;
  public params: IPaginationParams = {};

  /* ------------------------------- Filters ----------------------------- */
  public selectedCompany = signal<string | null>(null);
  public selectedStatus = signal<string | null>(null);

  public isCompanyOpen = signal(false);
  public isStatusOpen = signal(false);

  public companies = signal<IDropdown[]>([]);

  public statusOptions = [
    { value: null, label: ' كل الحالات' },
    { value: 'pending', label: 'معلق' },
    { value: 'approved', label: 'موافق' },
    { value: 'declined', label: 'مرفوض' }
  ];

  public statusDotsOptions = [
    { id: 'approved', name: 'الموافقة', icon: 'bx bx-check-circle text-green-600' },
    { id: 'pending', name: 'الانتظار', icon: 'bx bx-time text-yellow-600' },
    { id: 'declined', name: 'مرفوض', icon: 'bx bx-x-circle text-red-600' }
  ];

  searchControl = new FormControl('');

  /* --------------------------- Auth helpers --------------------------- */
  isCompanyUser = this.auth.isCompany();

  get userCompanyId(): string {
    return this.auth.UserId()!;
  }

  /* --------------------------- Lifecycle ------------------------------- */
  ngOnInit() {
    this.loadCompanies();
    this.setupSearch();
    this.applyCompanyAutoSelect();
    this.fetchPayments();
    console.log(this.auth.isCompany())
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.paginationService.goToPage(1);
  }

  /* --------------------------- Company auto-fill ---------------------- */
  private applyCompanyAutoSelect() {
    if (this.isCompanyUser && this.userCompanyId) {
      this.selectedCompany.set(this.userCompanyId);
      // No need to open dropdown – it will be hidden in the template
    }
  }

  /* --------------------------- Data loading -------------------------- */
  private loadCompanies() {
    this.companyService
      .getCompanyDropdown()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.companies.set(data));
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(value => {
          this.params.search = value || undefined;
          this.paginationService.goToPage(1);
          this.fetchPayments();
        })
      )
      .subscribe();
  }

  fetchPayments() {
    this.isLoading.set(true);

    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search
    };

    const filter: IPaymentFilter = {};
    if (this.selectedCompany()) filter.companyId = this.selectedCompany()!;
    if (this.selectedStatus()) filter.status = this.selectedStatus()!;

    this.paymentService
      .getAllPayments(filterParams, filter)
      .pipe(
        takeUntil(this.destroy$),
        tap(res => {
          this.payments.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe();
  }

  /* --------------------------- Dropdown toggles ----------------------- */
  toggleCompany() {
    if (this.isCompanyUser) return;
    this.isCompanyOpen.set(!this.isCompanyOpen());
    this.closeOthers('company');
  }

  toggleStatus() {
    this.isStatusOpen.set(!this.isStatusOpen());
    this.closeOthers('status');
  }

  private closeOthers(except: 'company' | 'status') {
    if (except !== 'company') this.isCompanyOpen.set(false);
    if (except !== 'status') this.isStatusOpen.set(false);
  }

  /* --------------------------- Selection handlers --------------------- */
  selectCompany(id: string | null) {
    this.selectedCompany.set(id);
    this.isCompanyOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchPayments();
  }

  selectStatus(status: string | null) {
    this.selectedStatus.set(status);
    this.isStatusOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchPayments();
  }

  /* --------------------------- UI helpers --------------------------- */
  getCompanyLabel(): string {
    if (this.isCompanyUser && this.userCompanyId) {
      const c = this.companies().find(x => x.id === this.userCompanyId);
      return c ? c.name : 'الشركة';
    }
    const c = this.companies().find(x => x.id === this.selectedCompany());
    return c ? c.name : ' كل الشركات ';
  }

  getStatusLabel(): string {
    const s = this.statusOptions.find(x => x.value === this.selectedStatus());
    return s ? s.label : ' كل الحالات ';
  }

  resetFilters() {
    this.selectedCompany.set(null);
    this.selectedStatus.set(null);
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.paginationService.goToPage(1);
    this.fetchPayments();
  }

  /* --------------------------- Misc helpers -------------------------- */
  onStatusSelected(requestId: string, newStatus: string): void {
    this.isLoading.set(true);
    this.paymentService
      .updatePaymentStatus(requestId, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toster.showSuccess('تم تحديث حالة الدفع بنجاح');
          this.isLoading.set(false);
          this.fetchPayments();
        }),
        catchError(() => {
          this.isLoading.set(false);
          return [];
        })
      )
      .subscribe();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('ar', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentTypeLabel(type: string): string {
    switch (type) {
      case 'Transfer':
        return 'تحويل';
      case 'Deposit':
        return 'إيداع';
      case 'Cash':
        return 'نقدي';
      default:
        return type;
    }
  }

  getPaymentTypeIcon(type: string): string {
    switch (type) {
      case 'Transfer':
        return 'bx bx-transfer-alt text-blue-500';
      case 'Deposit':
        return 'bx bx-down-arrow-circle text-green-500';
      case 'Cash':
        return 'bx bx-money text-yellow-500';
      default:
        return 'bx bx-help-circle text-gray-500';
    }
  }

  /* --------------------------- Pagination --------------------------- */
  onPageChange(page: number) {
    this.paginationService.goToPage(page);
    this.fetchPayments();
  }
  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchPayments();
  }
  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchPayments();
  }
}