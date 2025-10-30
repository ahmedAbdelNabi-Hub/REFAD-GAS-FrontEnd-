import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { FuelRequestService } from '../../../../../services/fuel-request.service';
import { finalize, Subject, takeUntil, tap } from 'rxjs';
import { IFuelRequestStatusSummary } from '../../../../../interface/FuelRequest/IFuelRequestStatusSummary';

@Component({
  selector: 'app-fuel-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fuel-summary.html',
  styleUrl: './fuel-summary.css'
})
export class FuelSummaryComponent implements OnInit, OnDestroy {
  private fuelService = inject(FuelRequestService);
  private destroy$ = new Subject<void>();

  // Raw data from API
  private rawSummary = signal<IFuelRequestStatusSummary[] | null>(null);

  // Safe computed values – always return 0 if missing
  public approved = computed(() => this.getStatus('approved'));
  public pending = computed(() => this.getStatus('pending'));
  public declined = computed(() => this.getStatus('declined'));

  public totalFuel = computed(() => {
    const data = this.rawSummary() ?? [];
    return data.reduce((sum, item) => sum + (item.totalCount ?? 0), 0);
  });

  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.fetchFuelSummary();
  }

  fetchFuelSummary(): void {
    this.isLoading.set(true);

    this.fuelService.getFuelStatusSummary()
      .pipe(
        takeUntil(this.destroy$),
        tap(response => {
          this.rawSummary.set(response ?? []);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  private getStatus(status: string) {
    const data = this.rawSummary() ?? [];
    const item = data.find(x => x.status === status);
    return {
      totalApprovedAmount: item?.totalApprovedAmount ?? 0,
      totalCount: item?.totalCount ?? 0
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}