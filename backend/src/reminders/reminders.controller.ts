import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './reminders.dto';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.remindersService.create(dto);
  }

  @Get('wallet/:walletAddress')
  findByWallet(@Param('walletAddress') walletAddress: string) {
    return this.remindersService.findByWallet(walletAddress);
  }
}
