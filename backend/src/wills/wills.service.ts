import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWillDto,
  UpdateOnchainDto,
  UpdateHeartbeatDto,
  UpdateClaimDto,
  UpdateCancelDto,
  UpdateBeneficiaryDto,
  buildStellarExplorerUrl,
} from './wills.dto';

@Injectable()
export class WillsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWillDto) {
    const explorerUrl = dto.createTxHash
      ? buildStellarExplorerUrl(dto.createTxHash)
      : undefined;

    return this.prisma.will.create({
      data: {
        ownerWallet: dto.ownerWallet,
        beneficiaryWallet: dto.beneficiaryWallet,
        asset: dto.asset,
        amount: dto.amount,
        unlockTime: new Date(dto.unlockTime),
        heartbeatInterval: dto.heartbeatInterval,
        lastHeartbeat: new Date(),
        status: 'ACTIVE',
        createTxHash: dto.createTxHash,
        onchainWillId: dto.onchainWillId,
        stellarExplorerUrl: explorerUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.will.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const will = await this.prisma.will.findUnique({ where: { id } });
    if (!will) throw new NotFoundException(`Will ${id} not found`);
    return will;
  }

  async findByOwner(walletAddress: string) {
    return this.prisma.will.findMany({
      where: { ownerWallet: walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByBeneficiary(walletAddress: string) {
    return this.prisma.will.findMany({
      where: { beneficiaryWallet: walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOnchain(id: string, dto: UpdateOnchainDto) {
    await this.findById(id);
    return this.prisma.will.update({
      where: { id },
      data: {
        onchainWillId: dto.onchainWillId,
        createTxHash: dto.createTxHash,
        stellarExplorerUrl: buildStellarExplorerUrl(dto.createTxHash),
      },
    });
  }

  async updateHeartbeat(id: string, dto: UpdateHeartbeatDto) {
    const will = await this.findById(id);
    const newUnlockTime = new Date(
      Date.now() + will.heartbeatInterval * 24 * 60 * 60 * 1000,
    );

    return this.prisma.will.update({
      where: { id },
      data: {
        lastHeartbeat: new Date(),
        unlockTime: newUnlockTime,
        heartbeatTxHash: dto.heartbeatTxHash,
        stellarExplorerUrl: buildStellarExplorerUrl(dto.heartbeatTxHash),
      },
    });
  }

  async updateClaim(id: string, dto: UpdateClaimDto) {
    await this.findById(id);
    return this.prisma.will.update({
      where: { id },
      data: {
        status: 'CLAIMED',
        claimTxHash: dto.claimTxHash,
        stellarExplorerUrl: buildStellarExplorerUrl(dto.claimTxHash),
      },
    });
  }

  async updateCancel(id: string, dto: UpdateCancelDto) {
    await this.findById(id);
    return this.prisma.will.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelTxHash: dto.cancelTxHash,
        stellarExplorerUrl: buildStellarExplorerUrl(dto.cancelTxHash),
      },
    });
  }

  async updateBeneficiary(id: string, dto: UpdateBeneficiaryDto) {
    await this.findById(id);
    return this.prisma.will.update({
      where: { id },
      data: {
        beneficiaryWallet: dto.newBeneficiaryWallet,
        changeBeneficiaryTxHash: dto.changeBeneficiaryTxHash,
        stellarExplorerUrl: buildStellarExplorerUrl(
          dto.changeBeneficiaryTxHash,
        ),
      },
    });
  }
}
