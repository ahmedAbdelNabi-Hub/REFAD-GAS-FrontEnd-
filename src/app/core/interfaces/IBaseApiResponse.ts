export interface IBaseApiResponse<T = any> {
    message: string;
    statusCode: number;
    data?: T;
}