import { Role } from './Role';

export type User = {
    id: number,
    name: string,
    email: string,
    role: Role,
    email_verified_at: string,
    created_at: string,
};