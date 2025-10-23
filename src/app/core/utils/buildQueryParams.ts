import { HttpParams } from "@angular/common/http";

export function buildQueryParams(paramsObj: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(paramsObj).forEach(key => {
        const value = paramsObj[key];
        if (value !== null && value !== undefined && value !== '') {
            httpParams = httpParams.set(key, value);
        }
    });
    return httpParams;
}
