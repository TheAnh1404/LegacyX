import { IsString, IsOptional, IsInt, IsNumber, Matches, Min } from 'class-validator';

const STELLAR_EXPERT_BASE = 'https://stellar.expert/explorer/testnet/tx';

export function buildStellarExplorerUrl(txHash: string): string {
  return `${STELLAR_EXPERT_BASE}/${txHash}`;
}

export class CreateWillDto {
  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/, { message: 'Invalid owner wallet address' })
  ownerWallet!: string;

  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/, { message: 'Invalid beneficiary wallet address' })
  beneficiaryWallet!: string;

  @IsString()
  asset!: string;

  @IsString()
  amount!: string;

  @IsString()
  unlockTime!: string;

  @IsInt()
  @Min(1)
  heartbeatInterval!: number;

  @IsOptional()
  @IsString()
  createTxHash?: string;

  @IsOptional()
  @IsInt()
  onchainWillId?: number;
}

export class UpdateOnchainDto {
  @IsInt()
  onchainWillId!: number;

  @IsString()
  createTxHash!: string;
}

export class UpdateHeartbeatDto {
  @IsString()
  heartbeatTxHash!: string;
}

export class UpdateClaimDto {
  @IsString()
  claimTxHash!: string;
}

export class UpdateCancelDto {
  @IsString()
  cancelTxHash!: string;
}

export class UpdateBeneficiaryDto {
  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/, { message: 'Invalid beneficiary wallet address' })
  newBeneficiaryWallet!: string;

  @IsString()
  changeBeneficiaryTxHash!: string;
}
