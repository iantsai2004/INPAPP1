import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  // Expose all Prisma model properties
  get user() {
    return this.client.user;
  }

  get video() {
    return this.client.video;
  }

  get comment() {
    return this.client.comment;
  }

  get group() {
    return this.client.group;
  }

  get groupRequirement() {
    return this.client.groupRequirement;
  }

  get groupMember() {
    return this.client.groupMember;
  }

  get milestone() {
    return this.client.milestone;
  }

  get progressEntry() {
    return this.client.progressEntry;
  }

  get favorite() {
    return this.client.favorite;
  }

  get commentLike() {
    return this.client.commentLike;
  }

  get watchHistory() {
    return this.client.watchHistory;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  async $transaction(fn: any) {
    return this.client.$transaction(fn);
  }
}

