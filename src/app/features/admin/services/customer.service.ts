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

@Injectable({ providedIn: 'root' })
export class CustomerService {

    private baseUrl = `${environment.apiUrl}/companies`;
    constructor(private http: HttpClient) { }
    createCompany(formData: FormData): Observable<IBaseApiResponse<number>> {
        return this.http.post<IBaseApiResponse<number>>(this.baseUrl, formData);
    }

    getAllCompanies(
        params: IPaginationParams,
        companyFilter: ICompanyFilter
    ): Observable<IPagination<ICompany>> {
        let httpParams = buildQueryParams({
            status: companyFilter.status,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
        });
        return this.http.get<IPagination<ICompany>>(this.baseUrl, { params: httpParams });
    }

    toggleCompanyStatus(companyId: string, newStatus: 'active' | 'suspended'): Observable<IBaseApiResponse> {
        const dto = { status: newStatus };
        return this.http.put<IBaseApiResponse>(`${this.baseUrl}/${companyId}/status`, dto);
    }



    getCompanyById(id: string): Observable<ICompany> {
        return this.http.get<ICompany>(`${this.baseUrl}/${id}`);
    }

    updateCompany(id: string, formData: FormData): Observable<IBaseApiResponse<any>> {
        return this.http.put<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`, formData);
    }

    getCompanyDropdown(): Observable<IDropdown[]> {
        return this.http.get<IDropdown[]>(`${this.baseUrl}/dropdown`);
    }

    deleteCompany(id: string): Observable<IBaseApiResponse<any>> {
        return this.http.delete<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`);
    }

}