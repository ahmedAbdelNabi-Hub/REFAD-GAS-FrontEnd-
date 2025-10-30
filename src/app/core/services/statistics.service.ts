import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDashboardStatistics } from '../../features/dashboard/interface/dashboard/IDashboardStatistics';

@Injectable({ providedIn: 'root' })
export class StatisticService {
    private baseUrl = `${environment.apiUrl}/statistics`;
    constructor(private http: HttpClient) { }

    getStatisticsCount(): Observable<IDashboardStatistics> {
        return this.http.get<IDashboardStatistics>(`${this.baseUrl}/count`);
    }
}