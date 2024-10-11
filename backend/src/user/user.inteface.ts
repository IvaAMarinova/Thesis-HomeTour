import { UserType } from "./user.entity";

export interface IUser {
    id: string;
    email: string;
    password: string;
    fullName: string;
    type: UserType;
    companyId?: string;
}