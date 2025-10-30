import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { ToastService } from '../../../../core/services/toast.service';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICompany } from '../../interface/Company/ICompany ';
import { CarsComponent } from "../cars/cars";

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, CarsComponent],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit {
  private readonly API_BASE_URL = 'https://localhost:7069';
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private toaster = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  private id = this.route.snapshot.paramMap.get('id') as string;

  company = signal<ICompany | null>(null);
  isLoading = signal<boolean>(true);
  activeTab = signal<string>('company');

  ngOnInit(): void {
    this.fetchCompany();
  }

  private fetchCompany(): void {
    console.log('Fetching company ID:', this.id);

    this.customerService.getCompanyById(this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(res => {
          if (res) {
            this.company.set(res);
          } else {
            this.toaster.showError('لم يتم العثور على الشركة.');
          }
        }),
        catchError(err => {
          console.error('Error fetching company:', err);
          this.toaster.showError('حدث خطأ أثناء تحميل بيانات الشركة.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'فعال';
      case 'pending': return 'قيد الانتظار';
      case 'suspended': return 'معلق';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-[#ecfdf3] text-[#48ba65]';
      case 'pending': return 'bg-yellow-50 text-yellow-600';
      case 'suspended': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/customers']);
  }

  getLogoUrl(): string {
    const logo = this.company()?.logoPath;
    return logo
      ? `${this.API_BASE_URL}/image/companies/logos/${logo}`
      : 'https://preline.co/assets/img/160x160/img1.jpg';
  }
}