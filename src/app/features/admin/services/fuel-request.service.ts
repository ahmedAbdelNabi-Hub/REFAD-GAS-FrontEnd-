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

@Injectable({ providedIn: 'root' })
export class FuelRequestService {
    private baseUrl = `${environment.apiUrl}/fuel-requests`;
    constructor(private http: HttpClient) { }


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