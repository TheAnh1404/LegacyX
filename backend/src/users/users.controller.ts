import { Controller, Post, Get, Patch, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserProfileDto, UpdateUserProfileDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  createProfile(@Body() dto: CreateUserProfileDto) {
    return this.usersService.createProfile(dto);
  }

  @Get('me')
  getMe(@Query('walletAddress') walletAddress: string) {
    return this.usersService.findByWallet(walletAddress);
  }

  @Patch('me')
  updateMe(
    @Query('walletAddress') walletAddress: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(walletAddress, dto);
  }
}
