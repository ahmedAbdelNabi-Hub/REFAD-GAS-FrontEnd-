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

@Component({
  selector: 'app-stations',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, Pagination],
  templateUrl: './stations.html',
  styleUrls: ['./stations.css']
})
export class StationsComponent {
  @ViewChild('mapModal') mapModal!: ElementRef<HTMLDialogElement>;

  private destroy$ = new Subject<void>();
  private readonly stationService = inject(StationService);
  private toster = inject(ToastService);
  readonly paginationService = inject(PaginationService);

  public stations = signal<IStation[]>([]);
  public isLoading = signal<boolean>(false);
  public selectedStation = signal<IStation | null>(null);
  public pageSize: number = 15;
  public params: IPaginationParams = {};

  searchControl = new FormControl('');

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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchStations() {
    this.isLoading.set(true);

    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search
    };

    this.stationService.getAllStations(filterParams)
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          this.stations.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({
        error: (err) => {
          this.isLoading.set(false);
          this.toster.showError('حدث خطأ أثناء جلب البيانات');
          console.error('Fetch stations error:', err);
        }
      });
  }

  // Reset search
  resetFilters() {
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.paginationService.goToPage(1);
    this.fetchStations();
  }

  deleteStation(stationId: string, event: Event) {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه المحطة؟')) {
      this.stationService.deleteStation(stationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toster.showSuccess('تم حذف المحطة بنجاح');
            this.fetchStations();
          },
          error: (err) => {
            this.toster.showError('حدث خطأ أثناء حذف المحطة');
            console.error('Delete station error:', err);
          }
        });
    }
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
}