import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IPaginationParams } from '../../../core/interfaces/IPaginationParams';
import { ICarFilter } from '../interface/Cars/ICarFilter';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IBaseApiResponse } from '../../../core/interfaces/IBaseApiResponse';
import { ICar } from '../interface/Cars/ICar';
import { buildQueryParams } from '../../../core/utils/buildQueryParams';
import { IPagination } from '../../../core/interfaces/IPagination';

@Injectable({ providedIn: 'root' })
export class CarService {
    private baseUrl = `${environment.apiUrl}/cars`;

    constructor(private http: HttpClient) { }

    createCar(formData: FormData): Observable<IBaseApiResponse<number>> {
        return this.http.post<IBaseApiResponse<number>>(this.baseUrl, formData);
    }

    getAllCars(params: IPaginationParams, filter: ICarFilter): Observable<IPagination<ICar>> {
        const httpParams = buildQueryParams({
            companyId: filter.companyId,
            status: filter.status,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
        });
        return this.http.get<IPagination<ICar>>(this.baseUrl, { params: httpParams });
    }
    getCarById(id: string): Observable<ICar> {
        return this.http.get<ICar>(`${this.baseUrl}/${id}`);
    }


    toggleCarStatus(carId: string, status: 'active' | 'inactive'): Observable<IBaseApiResponse> {
        const dto = { status: status };
        return this.http.put<IBaseApiResponse>(`${this.baseUrl}/${carId}/status`, dto);
    }

    updateCar(id: string, formData: FormData): Observable<IBaseApiResponse<any>> {
        return this.http.put<IBaseApiResponse<any>>(`${this.baseUrl}/${id}`, formData);
    }


    deleteCar(carId: string): Observable<any> {
        return of()
    }
    exportCarsToExcel(): Observable<any> {
        return of()
    }
}