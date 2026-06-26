import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class LinkWalletDto {
  @IsString()
  userId!: string;

  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/, { message: 'Invalid Stellar wallet address' })
  walletAddress!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
