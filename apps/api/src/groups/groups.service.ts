import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from '../seed';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeed() {
    await seedDatabase(this.prisma);
  }

  async findOne(id: string) {
    await this.ensureSeed();
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        milestones: true,
        requirements: true,
        members: true,
      },
    });

    if (!group) throw new NotFoundException('Group not found');

    return {
      id: group.id,
      title: group.title,
      goal: group.goal,
      memberCount: group.memberCount,
      progress: group.progress,
      requirementVideos: group.requirements?.map((r) => r.videoId) ?? [],
      milestones: group.milestones?.map((m) => m.title) ?? [],
      members: group.members.map((m) => ({
        userId: m.userId,
        status: m.status,
      })),
    };
  }

  async joinGroup(groupId: string, userId: string) {
    await this.ensureSeed();
    await this.prisma.group.findUniqueOrThrow({ where: { id: groupId } });
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await this.prisma.groupMember.upsert({
      where: { userId_groupId: { userId, groupId } },
      update: { status: 'joined' },
      create: { userId, groupId, status: 'joined' },
    });
    return { ok: true };
  }
}

