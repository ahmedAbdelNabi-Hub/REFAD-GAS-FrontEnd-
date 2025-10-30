import { Component, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Inject, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { StatisticService } from '../../../../core/services/statistics.service';
import { tap } from 'rxjs';
import { IDashboardStatistics } from '../../../dashboard/interface/dashboard/IDashboardStatistics';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('fuelChart', { static: false }) fuelChart!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  private statisticService = inject(StatisticService);
  public dashboardCounters = signal<IDashboardStatistics | null>(null);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  ngOnInit(): void {
    this.fatchCounters();
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.createChart(), 0);
    }
  }

  fatchCounters(): void {
    this.statisticService.getStatisticsCount().pipe(tap(rep => {
      this.dashboardCounters.set(rep)
    })).subscribe()
  }

  createChart() {
    const ctx = this.fuelChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Gradient for area fill (bottom → top)
    const fillGradient = ctx.createLinearGradient(0, 400, 0, 0);
    fillGradient.addColorStop(0.5, '#ffffff75'); // bottom white
    fillGradient.addColorStop(0.8, 'rgba(244, 236, 225, 0.9)'); // top beige, semi-opaque
    fillGradient.addColorStop(0.2, '#c29a5b'); // top beige, semi-opaque

    // Gradient for the line stroke (left → right)
    const lineGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    lineGradient.addColorStop(0, 'rgba(91, 91, 89, 1)');    // dark gray start
    lineGradient.addColorStop(1, 'rgba(194, 154, 91, 1)');  // golden brown end (#c29a5b)

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ],
        datasets: [
          {
            label: 'إجمالي المبالغ الشهرية (ريال سعودي)',
            data: [12000, 150000, 18000, 130000, 122000, 14000, 220500, 26000, 30, 28000, 250000, 32000, 29000, 3500],
            borderColor: '#c29a5b',
            backgroundColor: fillGradient,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#c29a5b',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#c29a5b',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3
          }
        ]
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
            titleFont: { weight: 'bold', size: 14 },
            bodyFont: { size: 13 },
            cornerRadius: 6,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#40444e',
              font: { size: 13 }
            },
            grid: {
              color: '#eeeeee'
            }
          },
          x: {
            ticks: {
              color: '#40444e',
              font: { size: 13 }
            },
            grid: {
              color: 'rgba(191, 192, 194, 0.15)'
            }
          }
        },
        layout: {
          padding: { top: 20, left: 10, right: 10, bottom: 10 }
        }
      }
    });
  }
}
