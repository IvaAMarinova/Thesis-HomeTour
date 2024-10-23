import { UserType } from "./user.entity";
import { Company } from "../company/company.entity";

export interface IUser {
    id: string;
    email: string;
    password: string;
    full_name: string;
    type: UserType;
    company?: Company;
}
