import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    
    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Generate salt
    const salt = randomBytes(16).toString('hex');
    
    // Hash password
    const hashedPassword = await this.hashPassword(password, salt);

    // Create user
    const user = this.userRepository.create({
      email,
      password: `${salt}:${hashedPassword}`,
      name,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const [salt, storedHash] = user.password.split(':');
    const isValid = await this.verifyPassword(password, salt, storedHash);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const hash = await scryptAsync(password, salt, 64) as Buffer;
    return hash.toString('hex');
  }

  private async verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
    const hash = await scryptAsync(password, salt, 64) as Buffer;
    const hashBuffer = Buffer.from(storedHash, 'hex');
    return timingSafeEqual(hash, hashBuffer);
  }
}
