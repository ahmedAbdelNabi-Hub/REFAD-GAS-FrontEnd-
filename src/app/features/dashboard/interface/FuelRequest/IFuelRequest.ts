export interface IFuelRequest {
  id: string;
  companyNameArabic: string;
  carPlateNumber: string;
  carType: string;
  fuelType: string;
  driverName: string;
  driverImageUrl: string;
  driverMobile: string;
  stationNameAr: string;
  stationLocationLat?: number;
  stationLocationLng?: number;
  qty: number;
  amount: number;
  status: string;
  requestDateTime: string; // ISO date string
  pumpImageBefore: string;
  pumpImageAfter: string;
  updateAt: string; // ISO date string
}
