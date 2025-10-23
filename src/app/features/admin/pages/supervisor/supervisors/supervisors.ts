import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IPaginationParams } from '../../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../../core/services/pagination.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ISupervisor } from '../../../interface/supervisor/ISupervisor';
import { SupervisorService } from '../../../services/supervisor.service';
import { Pagination } from "../../../../../shared/components/pagination/pagination";
import { ISupervisorFilter } from '../../../interface/supervisor/ISupervisorFilter';

@Component({
  selector: 'app-supervisors',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Pagination],
  templateUrl: './supervisors.html',
  styleUrl: './supervisors.css'
})
export class SupervisorsComponent {
  @ViewChild('actionModal') actionModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('roleDropdown') roleDropdown!: ElementRef;
  private destroy$ = new Subject<void>();
  private readonly supervisorService = inject(SupervisorService);
  private toster = inject(ToastService);
  readonly paginationService = inject(PaginationService);
  public supervisors = signal<ISupervisor[]>([]);
  public supervisorId = signal<string>('');
  public isLoading = signal<boolean>(false);
  public pageSize: number = 15;
  public params: IPaginationParams = {};
  selectedRole = signal<string>('');
  isRoleDropdownOpen = signal(false);
  public selectedStatus = signal<boolean | null>(null);
  public isStatusDropdownOpen = signal<boolean>(false);
  public statusOptions = [
    { value: null, label: 'الكل' },
    { value: true, label: 'فعال' },
    { value: false, label: 'غير فعال' }
  ];
  roleOptions = [
    { value: '', label: 'كل الأدوار' },
    { value: 'admin', label: 'مدير' },
    { value: 'super_admin', label: 'مشرف' },
  ];
  totalSupervisors = computed(() => this.supervisors().length);
  searchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(res => {
          this.params.search = this.searchControl.value || undefined;
          this.fetchSupervisors();
        })
      )
      .subscribe();

    this.fetchSupervisors();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchSupervisors() {
    this.isLoading.set(true);
    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search,
    };
    const supervisorFilter: ISupervisorFilter = {};
    if (this.selectedStatus() !== null) {
      supervisorFilter.isActive = this.selectedStatus()!;
    }
    if (this.selectedRole()) {
      supervisorFilter.role = this.selectedRole();
    }

    this.supervisorService.getAllSupervisors(filterParams, supervisorFilter)
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          this.supervisors.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({});
  }

  toggleStatusDropdown() {
    this.isStatusDropdownOpen.set(!this.isStatusDropdownOpen());
    this.isRoleDropdownOpen.set(false);
  }

  toggleRoleDropdown() {
    this.isRoleDropdownOpen.set(!this.isRoleDropdownOpen());
    this.isStatusDropdownOpen.set(false);
  }

  selectStatus(status: boolean | null) {
    this.selectedStatus.set(status);
    this.isStatusDropdownOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchSupervisors();
  }

  selectRole(role: string) {
    this.selectedRole.set(role);
    this.isRoleDropdownOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchSupervisors();
  }

  getSelectedStatusLabel(): string {
    const selected = this.statusOptions.find(opt => opt.value === this.selectedStatus());
    return selected ? selected.label : 'الحالة';
  }

  getSelectedRoleLabel(): string {
    const selected = this.roleOptions.find(opt => opt.value === this.selectedRole());
    return selected ? selected.label : 'الدور';
  }

  resetFilters() {
    this.selectedStatus.set(null);
    this.selectedRole.set('');
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.paginationService.goToPage(1);
    this.fetchSupervisors();
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-[#ecfdf3] text-[#48ba65]' : 'bg-red-50 text-red-600';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'فعال' : 'غير فعال';
  }

  toggleSupervisorStatus(supervisor: ISupervisor, event: Event) {
    event.stopPropagation();
    const newStatus = !supervisor.isActive;
    const oldStatus = supervisor.isActive;
    this.isLoading.set(true);
    this.supervisorService.toggleSupervisorStatus(supervisor.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.fetchSupervisors();
          this.toster.showSuccess(`تم تحديث حالة المشرف ${supervisor.fullName} إلى ${this.getStatusLabel(newStatus)} بنجاح`);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toster.showError('حدث خطأ أثناء تحديث حالة المشرف');
          this.isLoading.set(false);
          console.error('Status update error:', err);
        }
      });
  }

  deleteSupervisor() {

    this.supervisorService.deleteSupervisor(this.supervisorId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal()
          this.toster.showSuccess('تم حذف المشرف بنجاح');
          this.fetchSupervisors();
        },
        error: (err) => {
          this.closeModal()
          console.log(err)
          this.toster.showError(err.error.message);
        }
      });
  }

  showModal(id: string) {
    this.supervisorId.set(id);
    this.actionModal.nativeElement.showModal();
  }

  closeModal() {
    this.actionModal.nativeElement.close();
  }


  onPageChange(newPage: number) {
    this.paginationService.goToPage(newPage);
    this.fetchSupervisors();
  }

  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchSupervisors();
  }

  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchSupervisors();
  }

  onSizeChange(newSize: number) {
    this.paginationService.changePageSize(newSize);
    this.fetchSupervisors();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isStatusDropdownOpen() && this.statusDropdown) {
      const clickedInsideStatus = this.statusDropdown.nativeElement.contains(event.target as HTMLElement);
      if (!clickedInsideStatus) {
        this.isStatusDropdownOpen.set(false);
      }
    }
    if (this.isRoleDropdownOpen() && this.roleDropdown) {
      const clickedInsideRole = this.roleDropdown.nativeElement.contains(event.target as HTMLElement);
      if (!clickedInsideRole) {
        this.isRoleDropdownOpen.set(false);
      }
    }
  }
}