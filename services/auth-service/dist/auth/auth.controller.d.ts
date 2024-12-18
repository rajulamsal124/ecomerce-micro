import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, RegisterResponse, UserProfile } from './types/auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<RegisterResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    getProfile(user: any): Promise<UserProfile>;
}
