export interface IPayment {
    id: string;
    companyId: string;
    companyName: string;
    amount: number;
    paymentType: string;
    serviceType: string;
    status: string;
    description: string;
    referenceNumber: string;
    transactionDate: string;
}