import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { RefreshToken } from './refresh-token.entity';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; response: AuthResponseDto }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.email, hashed);

    return this.buildTokens(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; response: AuthResponseDto }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildTokens(user.id, user.email);
  }

  async refresh(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const hash = this.hashToken(rawToken);

    const stored = await this.refreshTokenRepository.findOneBy({ tokenHash: hash });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.refreshTokenRepository.delete(stored.id);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate — delete old, issue new
    await this.refreshTokenRepository.delete(stored.id);

    const user = await this.usersService.findById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const { raw: newRefreshToken, hash: newHash } = this.generateRefreshToken();

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const hash = this.hashToken(rawToken);
    await this.refreshTokenRepository.delete({ tokenHash: hash });
  }

  private async buildTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email });
    const { raw: refreshToken, hash } = this.generateRefreshToken();

    await this.refreshTokenRepository.save({
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });

    return { accessToken, refreshToken, response: { user: { id: userId, email } } };
  }

  private generateRefreshToken(): { raw: string; hash: string } {
    const raw = randomBytes(40).toString('hex');
    return { raw, hash: this.hashToken(raw) };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
