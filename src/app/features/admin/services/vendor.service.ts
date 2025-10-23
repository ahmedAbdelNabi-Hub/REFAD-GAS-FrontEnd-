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

@Injectable({ providedIn: 'root' })
export class VendorService {

    private baseUrl = `${environment.apiUrl}/vendors`;
    constructor(private http: HttpClient) { }
    createVendor(formData: FormData): Observable<IBaseApiResponse<number>> {
        return this.http.post<IBaseApiResponse<number>>(this.baseUrl, formData);
    }

    getAllVendors(
        params: IPaginationParams,
        vendorFilter: IVendorFilter
    ): Observable<IPagination<IVendor>> {
        let httpParams = buildQueryParams({
            status: vendorFilter.status,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
        });
        return this.http.get<IPagination<IVendor>>(this.baseUrl, { params: httpParams });
    }

    toggleVendorStatus(vendorId: string, newStatus: boolean): Observable<IBaseApiResponse> {
        return this.http.put<IBaseApiResponse>(`${this.baseUrl}/${vendorId}/status`, { IsActive: newStatus, Id: vendorId });
    }



    getVendorById(id: string): Observable<IVendor> {
        return this.http.get<IVendor>(`${this.baseUrl}/${id}`);
    }

    updateVendor(id: string, formData: any): Observable<IBaseApiResponse<any>> {
        return this.http.put<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`, formData);
    }

    getVendorDropdown(): Observable<IDropdown[]> {
        return this.http.get<IDropdown[]>(`${this.baseUrl}/dropdown`);
    }

    deleteCompany(id: string): Observable<IBaseApiResponse<any>> {
        return this.http.delete<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`);
    }

}