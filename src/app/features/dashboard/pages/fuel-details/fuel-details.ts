import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuelRequestService } from '../../services/fuel-request.service'; // Update path
import { ToastService } from '../../../../core/services/toast.service';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFuelRequest } from '../../interface/FuelRequest/IFuelRequest';

@Component({
  selector: 'app-fuel-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './fuel-details.html',
  styleUrl: './fuel-details.css'
})
export class FuelDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fuelService = inject(FuelRequestService);
  private toaster = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  private id = this.route.snapshot.paramMap.get('id') as string;

  fuelRequest = signal<IFuelRequest | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.fetchFuelRequest();
  }

  private fetchFuelRequest(): void {
    this.fuelService.getFuelById(this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(res => {
          if (res) {
            this.fuelRequest.set(res);
          } else {
            this.toaster.showError('لم يتم العثور على طلب الوقود.');
          }
        }),

        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'تمت الموافقة';
      case 'pending': return 'قيد الانتظار';
      case 'declined': return 'مرفوض';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-[#ecfdf3] text-[#48ba65]';
      case 'pending': return 'bg-yellow-50 text-yellow-600';
      case 'declined': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/fuel-orders']);
  }

  getImageUrl(path: string): string {
    return path ? `https://localhost:7069/image/driver/${path}` : 'https://via.placeholder.com/300x200?text=لا+توجد+صورة';
  }
}