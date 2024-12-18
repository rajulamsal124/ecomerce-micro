import { Controller, Post, Body, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthResponse, RegisterResponse, UserProfile } from './types/auth.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with email, password, and name'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered',
    type: RegisterResponse
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'User already exists'
  })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticates user and returns JWT token'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully logged in',
    type: AuthResponse
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid credentials'
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Returns the profile of the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile retrieved successfully',
    type: UserProfile
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid or expired token'
  })
  async getProfile(@Body() user: any): Promise<UserProfile> {
    return user;
  }
}
