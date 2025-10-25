import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { IDropdown } from '../../../../../core/interfaces/IDropdown';
import { IPaginationParams } from '../../../../../core/interfaces/IPaginationParams';
import { PaginationService } from '../../../../../core/services/pagination.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { FuelRequestService } from '../../../services/fuel-request.service';
import { IFuelRequestBasic } from '../../../interface/FuelRequest/IFuelRequestBasic';
import { IFuelRequestFilter } from '../../../interface/FuelRequest/IFuelRequestFilter';
import { Pagination } from "../../../../../shared/components/pagination/pagination";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fuels',
  imports: [Pagination, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './fuels.html',
  styleUrl: './fuels.css'
})
export class Fuels implements OnInit, OnDestroy {
  @ViewChild('companyDropdown') companyDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('carDropdown') carDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('stationDropdown') stationDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('statusDropdown') statusDropdown!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private readonly fuelService = inject(FuelRequestService);
  private toster = inject(ToastService);

  public readonly paginationService = inject(PaginationService);
  public fuelRequests = signal<IFuelRequestBasic[]>([]);
  public isLoading = signal<boolean>(false);
  public params: IPaginationParams = {};

  // Filters
  public selectedCompany = signal<string | null>(null);
  public selectedCar = signal<string | null>(null);
  public selectedStation = signal<string | null>(null);
  public selectedStatus = signal<'pending' | 'approved' | 'declined' | null>(null);

  public isCompanyOpen = signal(false);
  public isCarOpen = signal(false);
  public isStationOpen = signal(false);
  public isStatusOpen = signal(false);

  public companies = signal<IDropdown[]>([]);
  public cars = signal<IDropdown[]>([]);
  public stations = signal<IDropdown[]>([]);

  public statusOptions = [
    { value: null, label: 'اختار الحاله' },
    { value: 'pending', label: 'معلق' },
    { value: 'approved', label: 'موافق' },
    { value: 'declined', label: 'مرفوض' }
  ];

  searchControl = new FormControl('');

  ngOnInit() {
    // this.loadDropdowns();
    this.setupSearch();
    this.fetchFuelRequests();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.paginationService.goToPage(1);
  }

  // private loadDropdowns() {
  //   this.fuelService.getCompanies().subscribe(data => this.companies.set(data));
  //   this.fuelService.getStations().subscribe(data => this.stations.set(data));
  // }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(value => {
          this.params.search = value || undefined;
          this.paginationService.goToPage(1);
          this.fetchFuelRequests();
        })
      )
      .subscribe();
  }

  fetchFuelRequests() {
    this.isLoading.set(true);
    const filterParams: IPaginationParams = {
      pageIndex: this.paginationService.currentPage(),
      pageSize: this.paginationService.pageSize(),
      search: this.params.search
    };

    const filter: IFuelRequestFilter = {};
    if (this.selectedCompany()) filter.companyId = this.selectedCompany()!;
    if (this.selectedCar()) filter.carId = this.selectedCar()!;
    if (this.selectedStation()) filter.stationId = this.selectedStation()!;
    if (this.selectedStatus()) filter.status = this.selectedStatus()!;

    this.fuelService.getAllFuels(filterParams, filter)
      .pipe(
        takeUntil(this.destroy$),
        tap(res => {
          this.fuelRequests.set(res.data);
          this.paginationService.updateTotalItems(res.count);
          this.isLoading.set(false);
        })
      )
      .subscribe({

      });
  }

  // Dropdown Toggles
  toggleCompany() { this.isCompanyOpen.set(!this.isCompanyOpen()); this.closeOthers('company'); }
  toggleCar() { this.isCarOpen.set(!this.isCarOpen()); this.closeOthers('car'); }
  toggleStation() { this.isStationOpen.set(!this.isStationOpen()); this.closeOthers('station'); }
  toggleStatus() { this.isStatusOpen.set(!this.isStatusOpen()); this.closeOthers('status'); }

  private closeOthers(except: 'company' | 'car' | 'station' | 'status') {
    if (except !== 'company') this.isCompanyOpen.set(false);
    if (except !== 'car') this.isCarOpen.set(false);
    if (except !== 'station') this.isStationOpen.set(false);
    if (except !== 'status') this.isStatusOpen.set(false);
  }

  // Select Handlers
  selectCompany(id: string | null) {
    this.selectedCompany.set(id);
    this.selectedCar.set(null);
    this.cars.set([]);
    // if (id) {
    //   this.fuelService.getCarsByCompany(id).subscribe(data => this.cars.set(data));
    // }
    this.isCompanyOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchFuelRequests();
  }

  selectCar(id: string | null) {
    this.selectedCar.set(id);
    this.isCarOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchFuelRequests();
  }

  selectStation(id: string | null) {
    this.selectedStation.set(id);
    this.isStationOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchFuelRequests();
  }

  selectStatus(status: any) {
    this.selectedStatus.set(status);
    this.isStatusOpen.set(false);
    this.paginationService.goToPage(1);
    this.fetchFuelRequests();
  }

  // Labels
  getCompanyLabel() {
    const c = this.companies().find(x => x.id === this.selectedCompany());
    return c ? c.name : 'الشركة';
  }

  getCarLabel() {
    const c = this.cars().find(x => x.id === this.selectedCar());
    return c ? c.name : 'السيارة';
  }

  getStationLabel() {
    const s = this.stations().find(x => x.id === this.selectedStation());
    return s ? s.name : 'المحطة';
  }

  getStatusLabel() {
    const s = this.statusOptions.find(x => x.value === this.selectedStatus());
    return s ? s.label : 'الحالة';
  }

  resetFilters() {
    this.selectedCompany.set(null);
    this.selectedCar.set(null);
    this.selectedStation.set(null);
    this.selectedStatus.set(null);
    this.searchControl.setValue('');
    this.params.search = undefined;
    this.cars.set([]);
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
    console.log(date);
    return new Date(date).toLocaleString('ar');
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  // Pagination
  onPageChange(page: number) { this.paginationService.goToPage(page); this.fetchFuelRequests(); }
  onPreviousPage() { this.paginationService.goToPreviousPage(); this.fetchFuelRequests(); }
  onNextPage() { this.paginationService.goToNextPage(); this.fetchFuelRequests(); }
  onSizeChange(size: number) { this.paginationService.changePageSize(size); this.fetchFuelRequests(); }
}