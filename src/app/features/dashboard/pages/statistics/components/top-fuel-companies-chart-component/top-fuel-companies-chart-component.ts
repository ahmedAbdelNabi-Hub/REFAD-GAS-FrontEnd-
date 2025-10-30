// top-fuel-companies-chart.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ICompanyFuelStats {
  companyName: string;
  totalApprovedAmount: number;
}

@Component({
  selector: 'app-top-fuel-companies-chart',
  standalone: true,
  template: `
      <canvas #doughnutChart></canvas>
  `,

})
export class TopFuelCompaniesChartComponent implements OnInit, AfterViewInit {
  @ViewChild('doughnutChart') doughnutChart!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  private staticTestData: ICompanyFuelStats[] = [
    { companyName: 'شركة النقل السريع', totalApprovedAmount: 285_000 },
    { companyName: 'مؤسسة الشحن الدولي', totalApprovedAmount: 242_000 },
    { companyName: 'المتحدة للخدمات', totalApprovedAmount: 198_000 },
    { companyName: 'شركة الريادة', totalApprovedAmount: 165_000 },
    { companyName: 'الأفق الجديد', totalApprovedAmount: 132_000 }
  ];

  private readonly COLORS = ['#5b5b59', '#c29a5b', '#f2e9dc', '#8c8c8a', '#d9b992'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.createDoughnutChart(), 100);
    }
  }

  private createDoughnutChart(): void {
    const ctx = this.doughnutChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.staticTestData.map(c => c.companyName);
    const data = this.staticTestData.map(c => c.totalApprovedAmount);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'المبالغ المعتمدة (ريال)',
          data,
          backgroundColor: this.COLORS,
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 16,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#4a5568',
              font: { size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(45,55,72,0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 10,
            displayColors: true,
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed;
                const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${ctx.label}: ${value.toLocaleString()} ريال (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1600,
          easing: 'easeOutQuart'
        }
      }
    });
  }
}