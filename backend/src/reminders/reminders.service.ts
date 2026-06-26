import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './reminders.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        userId: dto.userId,
        willId: dto.willId,
        email: dto.email,
        reminderTime: new Date(dto.reminderTime),
      },
    });
  }

  async findByWallet(walletAddress: string) {
    // Find reminders by looking up wills owned by this wallet
    return this.prisma.reminder.findMany({
      where: {
        will: {
          ownerWallet: walletAddress,
        },
      },
      include: { will: true },
      orderBy: { reminderTime: 'asc' },
    });
  }
}
