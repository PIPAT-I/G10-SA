import type { Role } from "./Role";

export interface BorrowingLimit {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    MaxBooks: number;
    MaxDays: number;
}

export interface Profile {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    AvatarURL: string;
    UserID: string;
}

export interface User {
    UserID: string;
    Password?: string;
    Firstname: string;
    Lastname: string;
    Email: string;
    PhoneNumber: string;
    BorrowingLimitID: number;
    BorrowingLimit?: BorrowingLimit;
    RoleID: number;
    Role: Role;
    Profile?: Profile;
    CreatedAt: string;
    UpdatedAt: string;
}