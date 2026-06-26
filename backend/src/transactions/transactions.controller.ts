import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './transactions.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get('wallet/:walletAddress')
  findByWallet(@Param('walletAddress') walletAddress: string) {
    return this.transactionsService.findByWallet(walletAddress);
  }

  @Get('will/:willId')
  findByWill(@Param('willId') willId: string) {
    return this.transactionsService.findByWill(willId);
  }
}
