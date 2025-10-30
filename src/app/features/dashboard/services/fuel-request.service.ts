import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseApiResponse } from '../../../core/interfaces/IBaseApiResponse';
import { IPagination } from '../../../core/interfaces/IPagination';
import { IPaginationParams } from '../../../core/interfaces/IPaginationParams';
import { buildQueryParams } from '../../../core/utils/buildQueryParams';
import { IFuelRequestBasic } from '../interface/FuelRequest/IFuelRequestBasic';
import { IFuelRequestFilter } from '../interface/FuelRequest/IFuelRequestFilter';
import { IFuelRequestStatusSummary } from '../interface/FuelRequest/IFuelRequestStatusSummary';
import { IFuelRequest } from '../interface/FuelRequest/IFuelRequest';

@Injectable({ providedIn: 'root' })
export class FuelRequestService {
    private baseUrl = `${environment.apiUrl}/fuel-orders`;
    constructor(private http: HttpClient) { }

    getFuelStatusSummary(): Observable<IFuelRequestStatusSummary[]> {
        return this.http.get<IFuelRequestStatusSummary[]>(`${this.baseUrl}/summary`);
    }

    updateFuelStatus(fuelRequestId: string, status: string): Observable<IBaseApiResponse> {
        return this.http.patch<IBaseApiResponse>(`${this.baseUrl}/${fuelRequestId}/status`, { newStatus: status });
    }
    getFuelById(fuelRequestId: string): Observable<IFuelRequest> {
        return this.http.get<IFuelRequest>(`${this.baseUrl}/${fuelRequestId}`);
    }

    deleteFuelRequest(fuelRequestId: string): Observable<IBaseApiResponse> {
        return this.http.delete<IBaseApiResponse>(`${this.baseUrl}/${fuelRequestId}`);
    }
    getAllFuels(
        params: IPaginationParams,
        fuelFilter: IFuelRequestFilter
    ): Observable<IPagination<IFuelRequestBasic>> {
        let httpParams = buildQueryParams({
            status: fuelFilter.status,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
            companyId: fuelFilter.companyId,
            stationId: fuelFilter.stationId,
            carId: fuelFilter.carId
        });
        return this.http.get<IPagination<IFuelRequestBasic>>(this.baseUrl, { params: httpParams });
    }


}