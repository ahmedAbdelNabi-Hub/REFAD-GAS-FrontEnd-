import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StatisticService } from '../../../../core/services/statistics.service';
import { IDashboardStatistics } from '../../interface/dashboard/IDashboardStatistics';
import { toSignal } from '@angular/core/rxjs-interop';
import { TopFuelCompaniesChartComponent } from './components/top-fuel-companies-chart-component/top-fuel-companies-chart-component';

type ChartInstance = import('chart.js').Chart;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './Statistic.component.html',
  styleUrls: ['./Statistic.component.css'],
  imports: [TopFuelCompaniesChartComponent],
})
export class StatisticComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fuelChart', { static: true }) fuelChart!: ElementRef<HTMLCanvasElement>;

  private chart: ChartInstance | null = null;
  private readonly statisticService = inject(StatisticService);
  private readonly platformId = inject(PLATFORM_ID);
  ngOnInit(): void {

  }
  // -----------------------------------------------------------------
  // 1. Reactive data source (signal) – no manual subscribe/tap
  // -----------------------------------------------------------------
  private readonly stats$ = this.statisticService.getStatisticsCount();
  public readonly dashboardCounters = toSignal(this.stats$, { initialValue: null });

  // -----------------------------------------------------------------
  // 2. Effect that (re)creates the chart when counters arrive
  // -----------------------------------------------------------------
  constructor() {
    effect(() => {
      const counters = this.dashboardCounters();
      if (counters && isPlatformBrowser(this.platformId)) {
        this.loadChartJsAndRender(counters);
      }
    });
  }

  // -----------------------------------------------------------------
  // 3. Lifecycle – canvas is ready here, but we wait for data in the effect
  // -----------------------------------------------------------------
  ngAfterViewInit(): void {
    // nothing to do – the effect will fire as soon as data arrive
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  // -----------------------------------------------------------------
  // 4. Lazy-load Chart.js + build the chart (once per data change)
  // -----------------------------------------------------------------
  private async loadChartJsAndRender(_counters: IDashboardStatistics): Promise<void> {
    // Import only in the browser and only once
    const { Chart, registerables } = await import('chart.js/auto');
    Chart.register(...registerables);

    // Destroy previous instance (idempotent)
    this.chart?.destroy();

    const ctx = this.fuelChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // -----------------------------------------------------------------
    // Gradient (same as your original code)
    // -----------------------------------------------------------------
    const fillGradient = ctx.createLinearGradient(0, 400, 0, 0);
    fillGradient.addColorStop(0.0, 'rgba(194, 154, 91, 0.15)');
    fillGradient.addColorStop(0.4, 'rgba(194, 154, 91, 0.35)');
    fillGradient.addColorStop(0.8, 'rgba(194, 154, 91, 0.15)');
    fillGradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.00)');

    // -----------------------------------------------------------------
    // Sample data – replace with real values from `counters` if you have them
    // -----------------------------------------------------------------
    const monthlyData = [
      12000, 150000, 18000, 130000, 122000, 14000,
      220500, 26000, 30, 28000, 250000, 32000, 29000, 3500,
    ];

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
        ],
        datasets: [
          {
            label: 'إجمالي المبالغ الشهرية (ريال سعودي)',
            data: monthlyData,
            borderColor: '#c29a5bad',
            backgroundColor: fillGradient,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#40444e',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: { weight: 'bold' as const, size: 14 },
            bodyFont: { size: 13 },
            cornerRadius: 6,
            displayColors: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#40444e', font: { size: 13 } },
            grid: { color: '#eeeeee' },
          },
          x: {
            ticks: { color: '#40444e', font: { size: 13 } },
            grid: { color: 'rgba(191, 192, 194, 0.15)' },
          },
        },
        layout: { padding: { top: 20, left: 10, right: 10, bottom: 10 } },
      },
    });
  }
}