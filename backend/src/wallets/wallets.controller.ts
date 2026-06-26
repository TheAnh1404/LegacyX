import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { LinkWalletDto } from './wallets.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('link')
  linkWallet(@Body() dto: LinkWalletDto) {
    return this.walletsService.linkWallet(dto);
  }

  @Get(':walletAddress')
  getWallet(@Param('walletAddress') walletAddress: string) {
    return this.walletsService.findByAddress(walletAddress);
  }
}
