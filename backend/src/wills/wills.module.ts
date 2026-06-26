import { Module } from '@nestjs/common';
import { WillsController } from './wills.controller';
import { WillsService } from './wills.service';

@Module({
  controllers: [WillsController],
  providers: [WillsService],
  exports: [WillsService],
})
export class WillsModule {}
