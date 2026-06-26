import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserProfileDto, UpdateUserProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createProfile(dto: CreateUserProfileDto) {
    return this.prisma.user.upsert({
      where: { walletAddress: dto.walletAddress },
      update: {
        displayName: dto.displayName,
        email: dto.email,
      },
      create: {
        walletAddress: dto.walletAddress,
        displayName: dto.displayName,
        email: dto.email,
      },
    });
  }

  async findByWallet(walletAddress: string) {
    return this.prisma.user.findUnique({
      where: { walletAddress },
      include: { wallets: true },
    });
  }

  async updateProfile(walletAddress: string, dto: UpdateUserProfileDto) {
    return this.prisma.user.update({
      where: { walletAddress },
      data: {
        displayName: dto.displayName,
        email: dto.email,
      },
    });
  }
}
