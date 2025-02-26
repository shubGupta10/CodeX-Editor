export interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    profileImage?: string;
    isAdmin: boolean;
    provider: string;
    lastLogin: string; 
    createdAt: string; 
    updatedAt: string; 
}
