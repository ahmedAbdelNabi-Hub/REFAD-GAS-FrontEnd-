import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  standalone: true
})
export class Pagination {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalItems = input.required<number>(); // Changed from totalEmployees to totalItems for reusability
  startRecord = input.required<number>();
  endRecord = input.required<number>();
  pageNumbers = input.required<(number | string)[]>();
  isLoading = input.required<() => boolean>(); // Marked as required to match usage

  previousPage = output<void>();
  nextPage = output<void>();
  pageChange = output<number>();

  getPageButtonClass(page: number): string {
    return page === this.currentPage()
      ? 'px-3.5 py-2 text-xs font-semibold text-gray-700 bg-[#f5f5f5]  rounded-md '
      : 'px-3.5 py-2 text-xs font-medium text-gray-700   rounded-md hover:bg-gray-50 ';
  }
}
