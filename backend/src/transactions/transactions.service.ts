import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './transactions.dto';

const STELLAR_EXPERT_BASE = 'https://stellar.expert/explorer/testnet/tx';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        willId: dto.willId,
        walletAddress: dto.walletAddress,
        type: dto.type,
        txHash: dto.txHash,
        stellarExplorerUrl: `${STELLAR_EXPERT_BASE}/${dto.txHash}`,
        status: dto.status || 'SUCCESS',
      },
    });
  }

  async findByWallet(walletAddress: string) {
    return this.prisma.transaction.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByWill(willId: string) {
    return this.prisma.transaction.findMany({
      where: { willId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
