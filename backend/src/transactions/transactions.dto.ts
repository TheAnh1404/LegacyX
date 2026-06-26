import { IsString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  willId?: string;

  @IsString()
  walletAddress!: string;

  @IsString()
  type!: string;

  @IsString()
  txHash!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
