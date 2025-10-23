export interface ICompany {
    id: string;
    companyNameArabic: string;
    companyNameEnglish: string;
    responsiblePerson: string;
    identityId: string;
    mobile: string;
    email: string;
    address: string;

    pumpImageRequired: boolean;
    carImageRequired: boolean;
    carLimitType: 'daily' | 'weekly' | 'monthly';
    carLimitCount: number;
    monthlyCostPerCar: number;
    status: "active" | "pending" | "suspended"; // Union type
    logoPath?: string | null;
    documentsPaths?: string[] | null;

    createdAt: string;
    updatedAt: string;
}
