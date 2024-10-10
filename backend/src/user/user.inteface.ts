import { UserType } from "./user.entity";

export interface IUser {
    id: string;
    email: string;
    password: string;
    name: string;
    type: UserType;
    companyId: string;
}