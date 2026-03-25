import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

@Injectable()
export class UsersSeeder implements OnModuleInit {
  private readonly logger = new Logger(UsersSeeder.name);

  private readonly defaultUser = {
    email: 'admin@qashio.com',
    password: 'Admin@123',
  };

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.usersService.findByEmail(this.defaultUser.email);
    if (existing) {
      this.logger.log(`Default user already exists (${this.defaultUser.email})`);
      return;
    }

    const hashed = await bcrypt.hash(this.defaultUser.password, 10);
    await this.usersService.create(this.defaultUser.email, hashed);
    this.logger.log(`Seeded default user: ${this.defaultUser.email}`);
  }
}
