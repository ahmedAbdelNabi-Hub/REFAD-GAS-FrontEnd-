import {
  AfterViewInit,
  Component,
  computed,
  effect,
  EventEmitter,
  Inject,
  input,
  Output,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './location-picker.html',
  styleUrls: ['./location-picker.css'],
})
export class LocationPicker implements AfterViewInit {
  @ViewChild(GoogleMap) map!: GoogleMap;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  // Input signal for coordinates from parent
  coordinates = input<{ lat: number; lng: number } | null>();

  zoom = signal(15);
  center = signal<google.maps.LatLngLiteral>({ lat: 24.7136, lng: 46.6753 }); // Riyadh
  markerPosition = signal<google.maps.LatLngLiteral | null>(null);

  options: google.maps.MapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Effect to watch for coordinate changes from parent
    effect(() => {
      const coords = this.coordinates();
      if (coords && this.isValidLatLng(coords.lat, coords.lng)) {
        console.log('LocationPicker coordinates changed:', coords);
        this.markerPosition.set(coords);
        this.center.set(coords);
        this.zoom.set(15)

      }
    });
  }

  ngAfterViewInit() {
    console.log('LocationPicker initialized');
  }

  private isValidLatLng(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      isFinite(lat) &&
      isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.markerPosition.set(coords);
      console.log('Location selected (map click):', coords);
      this.locationSelected.emit(coords);
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      this.markerPosition.set(coords);
      console.log('Marker dragged to:', coords);
      this.locationSelected.emit(coords);
    }
  }
}