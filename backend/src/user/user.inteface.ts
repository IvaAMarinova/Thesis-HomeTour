import { UserType } from "./user.entity";
import { Company } from "../company/company.entity";

export interface IUser {
    id: string;
    email: string;
    password: string;
    fullName: string;
    type: UserType;
    accessToken?: string;
    refreshToken?: string;
    company?: Company;
}
