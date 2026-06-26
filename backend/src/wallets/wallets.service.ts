import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkWalletDto } from './wallets.dto';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async linkWallet(dto: LinkWalletDto) {
    return this.prisma.wallet.upsert({
      where: { walletAddress: dto.walletAddress },
      update: {
        isPrimary: dto.isPrimary ?? false,
      },
      create: {
        userId: dto.userId,
        walletAddress: dto.walletAddress,
        isPrimary: dto.isPrimary ?? true,
      },
    });
  }

  async findByAddress(walletAddress: string) {
    return this.prisma.wallet.findUnique({
      where: { walletAddress },
      include: { user: true },
    });
  }
}
