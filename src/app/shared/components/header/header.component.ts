import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HeaderService } from '../../../core/services/header.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] 
})
export class HeaderComponent implements OnInit, OnDestroy {
  private headerService = inject(HeaderService);
  private subscription!: Subscription;
  public headerTitle = signal<string>('');

  ngOnInit(): void {
    this.subscription = this.headerService.getHeaderName().subscribe(name => {
      this.headerTitle.set(name ?? '');
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
