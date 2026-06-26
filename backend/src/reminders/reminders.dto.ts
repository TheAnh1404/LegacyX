import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateReminderDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  willId!: string;

  @IsEmail()
  email!: string;

  @IsDateString()
  reminderTime!: string;
}
