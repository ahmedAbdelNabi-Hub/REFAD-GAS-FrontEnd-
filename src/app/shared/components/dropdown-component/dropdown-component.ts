import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDropdown } from '../../../core/interfaces/IDropdown';


@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-component.html',
  styleUrls: ['./dropdown-component.css']
})
export class DropdownComponent {
  @Input() options: IDropdown[] = [];
  @Input() placeholder: string = 'Select';
  @Input() selectedId: string | null = null;
  @Output() selectedChange = new EventEmitter<string>();

  isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  selectOption(id: string) {
    this.selectedId = id;
    this.selectedChange.emit(id);
    this.isOpen.set(false);
  }

  get selectedLabel(): string {
    const selected = this.options.find(o => o.id === this.selectedId);
    return selected ? selected.name : this.placeholder;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isOpen.set(false);
    }
  }
}
