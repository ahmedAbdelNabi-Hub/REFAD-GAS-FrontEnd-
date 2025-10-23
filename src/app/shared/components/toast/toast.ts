import { Component, ElementRef, Inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  private destroy$ = new Subject<void>();
  messageQueue = signal<{ message: string; type: string; id?: number }[]>([]);
  private messageCounter = 0;
  private autoDismissTimer?: any;

  constructor(
    private toastService: ToastService,
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.toastService.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ message, type }) => {
        const newMessage = { message, type, id: ++this.messageCounter };
        const currentQueue = this.messageQueue();
        this.messageQueue.set([...currentQueue, newMessage]);

        // Auto dismiss (browser only)
        if (isPlatformBrowser(this.platformId)) {
          this.autoDismissTimer = setTimeout(
            () => this.closeToastById(newMessage.id!),
            6000
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.autoDismissTimer && isPlatformBrowser(this.platformId)) {
      clearTimeout(this.autoDismissTimer);
    }
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  closeToast(index: number): void {
    const currentQueue = [...this.messageQueue()];
    const toastElement = document.querySelectorAll('.toast-enter')[index] as HTMLElement;

    if (isPlatformBrowser(this.platformId) && toastElement) {
      toastElement.classList.add('toast-leave');

      setTimeout(() => {
        currentQueue.splice(index, 1);
        this.messageQueue.set(currentQueue);
      }, 250); // wait for leave animation
    } else {
      // SSR-safe fallback (instant remove)
      currentQueue.splice(index, 1);
      this.messageQueue.set(currentQueue);
    }
  }

  private closeToastById(id: number): void {
    const currentQueue = [...this.messageQueue()];
    const index = currentQueue.findIndex(item => item.id === id);
    if (index !== -1) this.closeToast(index);
  }
}
