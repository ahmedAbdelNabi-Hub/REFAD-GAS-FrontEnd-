export enum AccountStatus {
    Active = 1,    // User can log in and use the system
    Block = 2,     // User is blocked
    Deleted = 3,   // Marked as deleted (soft delete)
    Pending = 4    // Awaiting approval/verification
}
