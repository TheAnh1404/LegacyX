import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { WillsService } from './wills.service';
import {
  CreateWillDto,
  UpdateOnchainDto,
  UpdateHeartbeatDto,
  UpdateClaimDto,
  UpdateCancelDto,
  UpdateBeneficiaryDto,
} from './wills.dto';

@Controller('wills')
export class WillsController {
  constructor(private readonly willsService: WillsService) {}

  @Post()
  create(@Body() dto: CreateWillDto) {
    return this.willsService.create(dto);
  }

  @Get()
  findAll() {
    return this.willsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.willsService.findById(id);
  }

  @Get('owner/:walletAddress')
  findByOwner(@Param('walletAddress') walletAddress: string) {
    return this.willsService.findByOwner(walletAddress);
  }

  @Get('beneficiary/:walletAddress')
  findByBeneficiary(@Param('walletAddress') walletAddress: string) {
    return this.willsService.findByBeneficiary(walletAddress);
  }

  @Patch(':id/onchain')
  updateOnchain(@Param('id') id: string, @Body() dto: UpdateOnchainDto) {
    return this.willsService.updateOnchain(id, dto);
  }

  @Patch(':id/heartbeat')
  updateHeartbeat(@Param('id') id: string, @Body() dto: UpdateHeartbeatDto) {
    return this.willsService.updateHeartbeat(id, dto);
  }

  @Patch(':id/claim')
  updateClaim(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    return this.willsService.updateClaim(id, dto);
  }

  @Patch(':id/cancel')
  updateCancel(@Param('id') id: string, @Body() dto: UpdateCancelDto) {
    return this.willsService.updateCancel(id, dto);
  }

  @Patch(':id/beneficiary')
  updateBeneficiary(
    @Param('id') id: string,
    @Body() dto: UpdateBeneficiaryDto,
  ) {
    return this.willsService.updateBeneficiary(id, dto);
  }
}
