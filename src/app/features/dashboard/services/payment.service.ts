import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseApiResponse } from '../../../core/interfaces/IBaseApiResponse';
import { IPagination } from '../../../core/interfaces/IPagination';
import { IPaginationParams } from '../../../core/interfaces/IPaginationParams';
import { buildQueryParams } from '../../../core/utils/buildQueryParams';
import { environment } from '../../../environments/environment';
import { IStation } from '../interface/Stations/IStation';
import { IPaymentFilter } from '../interface/Payments/IPaymentFilter';
import { IPayment } from '../interface/Payments/IPayment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private baseUrl = `${environment.apiUrl}/payments`;
    constructor(private http: HttpClient) { }

    createPayment(formData: any): Observable<IBaseApiResponse<number>> {
        return this.http.post<IBaseApiResponse<number>>(this.baseUrl, formData);
    }

    updatePaymentStatus(paymentId: string, newStatus: string): Observable<IBaseApiResponse> {
        return this.http.patch<IBaseApiResponse>(`${this.baseUrl}/${paymentId}/status`, { newStatus: newStatus });
    }

    getAllPayments(
        params: IPaginationParams, filter: IPaymentFilter
    ): Observable<IPagination<IPayment>> {
        let httpParams = buildQueryParams({
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            search: params.search,
            status: filter.status,
            companyId: filter.companyId
        });
        return this.http.get<IPagination<IPayment>>(this.baseUrl, { params: httpParams });
    }
}