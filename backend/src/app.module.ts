import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WillsModule } from './wills/wills.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    UsersModule,
    WalletsModule,
    WillsModule,
    TransactionsModule,
    RemindersModule,
  ],
})
export class AppModule {}
