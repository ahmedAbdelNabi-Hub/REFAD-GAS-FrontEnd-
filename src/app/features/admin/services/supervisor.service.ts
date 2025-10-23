import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseApiResponse } from '../../../core/interfaces/IBaseApiResponse';
import { IPagination } from '../../../core/interfaces/IPagination';
import { IPaginationParams } from '../../../core/interfaces/IPaginationParams';
import { buildQueryParams } from '../../../core/utils/buildQueryParams';
import { environment } from '../../../environments/environment';
import { ISupervisor } from '../interface/supervisor/ISupervisor';
import { ISupervisorFilter } from '../interface/supervisor/ISupervisorFilter';

@Injectable({ providedIn: 'root' })
export class SupervisorService {
    private baseUrl = `${environment.apiUrl}/supervisors`;
    constructor(private http: HttpClient) { }
    createSupervisor(formData: FormData): Observable<IBaseApiResponse<number>> {
        return this.http.post<IBaseApiResponse<number>>(this.baseUrl, formData);
    }
    getSupervisorById(id: string): Observable<ISupervisor> {
        return this.http.get<ISupervisor>(`${this.baseUrl}/${id}`);
    }

    updateSupervisor(id: string, formData: any): Observable<IBaseApiResponse<any>> {
        return this.http.put<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`, formData);
    }

    toggleSupervisorStatus(supervisorId: string, newStatus: boolean): Observable<IBaseApiResponse> {
        const dto = { IsActive: newStatus, AdminId: supervisorId };
        return this.http.put<IBaseApiResponse>(`${this.baseUrl}/status`, dto);
    }


    getAllSupervisors(
        params: IPaginationParams,
        supervisorFilter: ISupervisorFilter
    ): Observable<IPagination<ISupervisor>> {
        let httpParams = buildQueryParams({
            isActive: supervisorFilter.isActive,
            role: supervisorFilter.role,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
        });
        return this.http.get<IPagination<ISupervisor>>(this.baseUrl, { params: httpParams });
    }

    deleteSupervisor(id: string): Observable<IBaseApiResponse> {
        return this.http.delete<IBaseApiResponse>(`${this.baseUrl}/${id}`);
    }
}