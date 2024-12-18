export declare class UserProfile {
    id: string;
    email: string;
    name: string;
}
export declare class AuthResponse {
    access_token: string;
    user: UserProfile;
}
export declare class RegisterResponse extends AuthResponse {
}
