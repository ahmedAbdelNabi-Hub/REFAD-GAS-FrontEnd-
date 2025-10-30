import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, tap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StationService } from '../../../services/station.service';
import { IPaginationParams } from '../../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../../core/services/pagination.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { Pagination } from '../../../../../shared/components/pagination/pagination';
import { IStation } from '../../../interface/Stations/IStation';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { VendorService } from '../../../services/vendor.service';
import { DropdownComponent } from "../../../../../shared/components/dropdown-component/dropdown-component";

@Component({
  selector: 'app-stations',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, Pagination, DropdownComponent],
  templateUrl: './stations.html',
  styleUrls: ['./stations.css']
})
export class StationsComponent {
  @ViewChild('mapModal') mapModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('actionModal') actionModal!: ElementRef<HTMLDialogElement>;

  private destroy$ = new Subject<void>();
  private readonly stationService = inject(StationService);
  private readonly vendorService = inject(VendorService);
  private toster = inject(ToastService);
  readonly paginationService = inject(PaginationService);

  public stations = signal<IStation[]>([]);
  public isLoading = signal<boolean>(false);
  public selectedStation = signal<IStation | null>(null);
  public pageSize: number = 15;
  public params: IPaginationParams = {};
  public stationId = signal<string>('');
  searchControl = new FormControl('');

  // vendor 
  vendorId = signal<string>('')
  vendorDrowdown = signal<IDropdown[]>([])


  //

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(res => {
          this.params.search = this.searchControl.value || undefined;
          this.fetchStations();
        })
      )
      .subscribe();
    this.fetchStations();
    this.fatchvendorDrowdown()
  }

  fatchvendorDrowdown(): void {
    this.vendorService.getVendorDropdown().pipe(tap(res => {
      this.vendorDrowdown.set(res)
    })).subscribe()
  }

  selectVendor(vendorId: string): void {
    this.vendorId.set(vendorId)
    this.fetchStations()
  }



  fetchStations() {
    this.isLoading.set(true);
    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search
    };
    this.stationService.getAllStations(filterParams, this.vendorId())
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          this.stations.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({

      });
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.selectVendor('');
    this.paginationService.goToPage(1);
    this.fetchStations();
  }

  deleteStation() {
    this.stationService.deleteStation(this.stationId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toster.showSuccess('تم حذف المحطة بنجاح');
          this.fetchStations();
          this.closeModal()
        },
        error: (err) => {
          this.toster.showError('حدث خطأ أثناء حذف المحطة');
          console.error('Delete station error:', err);
          this.closeModal()

        }
      });

  }

  showModal(id: string) {
    this.stationId.set(id);
    this.actionModal.nativeElement.showModal();
  }

  closeModal() {
    this.actionModal.nativeElement.close();
  }


  onPageChange(newPage: number) {
    this.paginationService.goToPage(newPage);
    this.fetchStations();
  }

  onPreviousPage() {
    this.paginationService.goToPreviousPage();
    this.fetchStations();
  }

  onNextPage() {
    this.paginationService.goToNextPage();
    this.fetchStations();
  }

  onSizeChange(newSize: number) {
    this.paginationService.changePageSize(newSize);
    this.fetchStations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}