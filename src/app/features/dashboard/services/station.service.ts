import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseApiResponse } from '../../../core/interfaces/IBaseApiResponse';
import { environment } from '../../../environments/environment';
import { ICompany } from '../interface/Company/ICompany ';
import { IPaginationParams } from '../../../core/interfaces/IPaginationParams';
import { IPagination } from '../../../core/interfaces/IPagination';
import { buildQueryParams } from '../../../core/utils/buildQueryParams';
import { ICompanyFilter } from '../interface/Company/ICompanyFilter';
import { IDropdown } from '../../../core/interfaces/IDropdown';
import { IVendorFilter } from '../interface/Vendor/IVendorFilter';
import { IVendor } from '../interface/Vendor/IVendor';
import { IStation } from '../interface/Stations/IStation';

@Injectable({ providedIn: 'root' })
export class StationService {

    private baseUrl = `${environment.apiUrl}/stations`;
    constructor(private http: HttpClient) { }
    createStation(formData: FormData): Observable<IBaseApiResponse<number>> {
        return this.http.post<IBaseApiResponse<number>>(this.baseUrl, formData);
    }

    getAllStations(
        params: IPaginationParams, vendorId: string
    ): Observable<IPagination<IStation>> {
        let httpParams = buildQueryParams({
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
            vendorId: vendorId
        });
        return this.http.get<IPagination<IStation>>(this.baseUrl, { params: httpParams });
    }

    getStationById(id: string): Observable<IStation> {
        return this.http.get<IStation>(`${this.baseUrl}/${id}`);
    }

    updateStation(id: string, formData: any): Observable<IBaseApiResponse<any>> {
        return this.http.put<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`, formData);
    }


    deleteStation(id: string): Observable<IBaseApiResponse<any>> {
        return this.http.delete<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`);
    }

}