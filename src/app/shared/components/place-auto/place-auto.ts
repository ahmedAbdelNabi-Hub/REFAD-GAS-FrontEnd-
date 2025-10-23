import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PlaceSearchResult {
  address: string;
  location?: google.maps.LatLng;
  imageUrl?: string;
  iconUrl?: string;
  name?: string;
}

@Component({
  selector: 'app-place-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full">
      <label *ngIf="label" class="block mb-2 text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <input
        #inputField
        type="text"
        [placeholder]="placeholder"
        class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PlaceAutocompleteComponent implements OnInit, AfterViewInit {
  @ViewChild('inputField') inputField!: ElementRef;
  @Input() placeholder = 'Enter address...';
  @Input() label?: string;
  @Output() placeChanged = new EventEmitter<PlaceSearchResult>();

  private autocomplete!: google.maps.places.Autocomplete;
  private initAttempts = 0;
  private readonly maxAttempts = 50; // 5 seconds max wait

  constructor(private ngZone: NgZone) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  private initAutocomplete() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      this.initAttempts++;

      if (this.initAttempts < this.maxAttempts) {
        setTimeout(() => this.initAutocomplete(), 100);
      } else {
        console.error('Google Maps JavaScript API failed to load after maximum attempts');
      }
      return;
    }

    this.autocomplete = new google.maps.places.Autocomplete(
      this.inputField.nativeElement,
      { types: ['geocode'] }
    );

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete.getPlace();
        const result: PlaceSearchResult = {
          address: this.inputField.nativeElement.value,
          name: place?.name,
          location: place?.geometry?.location,
          imageUrl: this.getPhotoUrl(place),
          iconUrl: place?.icon,
        };
        this.placeChanged.emit(result);
      });
    });
  }

  private getPhotoUrl(
    place: google.maps.places.PlaceResult | undefined
  ): string | undefined {
    return place?.photos && place?.photos.length > 0
      ? place.photos[0].getUrl({ maxWidth: 500 })
      : undefined;
  }

  ngOnDestroy() {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
  }
}