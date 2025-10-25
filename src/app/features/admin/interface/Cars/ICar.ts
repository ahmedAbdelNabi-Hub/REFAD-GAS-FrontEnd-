export interface ICar {
    id: string;
    companyId: string;
    plateNumber: string;
    carType: string;
    fuelType: string;
    status: 'active' | 'inactive';
    controlType: string;
    limitQty: number;
    usedQty: number;
    driverName: string;
    driverMobile: string;
    driverPassword: string;
    driverImageUrl?: string;
    startDay?: string;
    companyName: string;
}