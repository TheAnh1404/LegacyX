import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/, { message: 'Invalid Stellar wallet address' })
  walletAddress!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  emailNotifications?: boolean;
}
