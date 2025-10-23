import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PaginationService {
    public currentPage = signal<number>(1);
    public pageSize = signal<number>(15);
    public totalItems = signal<number>(0);

    public totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
    public startRecord = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize() + 1;
        return this.totalItems() === 0 ? 0 : start;
    });
    public endRecord = computed(() => {
        const end = this.currentPage() * this.pageSize();
        return Math.min(end, this.totalItems());
    });
    public pageNumbers = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: (number | string)[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            if (current <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                if (total > 6) {
                    pages.push('...');
                    pages.push(total);
                }
            } else if (current >= total - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = total - 4; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = current - 1; i <= current + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total);
            }
        }
        return pages;
    });

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
            this.currentPage.set(page);
        }
    }

    goToPreviousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
        }
    }

    goToNextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.set(this.currentPage() + 1);
        }
    }

    changePageSize(newSize: number): void {
        this.pageSize.set(newSize);
        this.currentPage.set(1);
    }

    updateTotalItems(total: number): void {
        this.totalItems.set(total);
    }
}