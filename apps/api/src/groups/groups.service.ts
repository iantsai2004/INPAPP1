import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from '../seed';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeed() {
    await seedDatabase(this.prisma);
  }

  async findAll(limit = 20) {
    await this.ensureSeed();
    const groups = await this.prisma.group.findMany({
      include: {
        milestones: true,
        requirements: true,
        members: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return groups.map((g) => this.mapGroup(g));
  }

  async findOne(id: string) {
    await this.ensureSeed();
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        milestones: { include: { progressEntries: { include: { user: true } } } },
        requirements: { include: { video: true } },
        members: { include: { user: true } },
      },
    });

    if (!group) throw new NotFoundException('Group not found');

    return {
      id: group.id,
      title: group.title,
      description: group.description,
      goal: group.goal,
      image: group.image,
      memberCount: group.memberCount,
      progress: group.progress,
      createdAt: group.createdAt,
      requirementVideos: group.requirements?.map((r) => ({
        videoId: r.videoId,
        title: r.video?.title,
      })) ?? [],
      milestones: group.milestones?.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        status: m.status,
        targetDate: m.targetDate,
        progressCount: m.progressEntries?.length ?? 0,
        progressEntries: m.progressEntries?.map((p) => ({
          userId: p.userId,
          userName: p.user?.name,
          note: p.note,
          createdAt: p.createdAt,
        })) ?? [],
      })) ?? [],
      members: group.members.map((m) => ({
        userId: m.userId,
        userName: m.user?.name,
        userAvatar: m.user?.avatar,
        status: m.status,
        joinedAt: m.joinedAt,
      })),
    };
  }

  async create(data: {
    title: string;
    description?: string;
    goal?: string;
    image?: string;
    requirementVideoIds?: string[];
  }) {
    await this.ensureSeed();
    const group = await this.prisma.group.create({
      data: {
        title: data.title,
        description: data.description,
        goal: data.goal,
        image: data.image,
      },
    });

    if (data.requirementVideoIds?.length) {
      await this.prisma.groupRequirement.createMany({
        data: data.requirementVideoIds.map((videoId) => ({
          groupId: group.id,
          videoId,
        })),
      });
    }

    return this.findOne(group.id);
  }

  async joinGroup(groupId: string, userId: string) {
    await this.ensureSeed();
    await this.prisma.group.findUniqueOrThrow({ where: { id: groupId } });
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    
    const member = await this.prisma.groupMember.upsert({
      where: { userId_groupId: { userId, groupId } },
      update: { status: 'joined' },
      create: { userId, groupId, status: 'joined' },
    });

    // Update member count
    const memberCount = await this.prisma.groupMember.count({
      where: { groupId, status: 'joined' },
    });
    await this.prisma.group.update({
      where: { id: groupId },
      data: { memberCount },
    });

    return { ok: true };
  }

  async leaveGroup(groupId: string, userId: string) {
    await this.ensureSeed();
    await this.prisma.groupMember.deleteMany({
      where: { userId, groupId },
    });

    // Update member count
    const memberCount = await this.prisma.groupMember.count({
      where: { groupId, status: 'joined' },
    });
    await this.prisma.group.update({
      where: { id: groupId },
      data: { memberCount },
    });

    return { ok: true };
  }

  async addMilestone(groupId: string, data: { title: string; description?: string; targetDate?: string }) {
    await this.ensureSeed();
    const milestone = await this.prisma.milestone.create({
      data: {
        groupId,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: 'planned',
      },
    });
    return milestone;
  }

  async updateMilestoneStatus(milestoneId: number, status: 'planned' | 'in_progress' | 'done') {
    await this.ensureSeed();
    const milestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status },
    });
    return milestone;
  }

  async addProgressEntry(milestoneId: number, userId: string, note?: string) {
    await this.ensureSeed();
    const entry = await this.prisma.progressEntry.create({
      data: { milestoneId, userId, note },
      include: { user: true },
    });
    return {
      id: entry.id,
      userName: entry.user?.name,
      note: entry.note,
      createdAt: entry.createdAt,
    };
  }

  private mapGroup(group: any) {
    return {
      id: group.id,
      title: group.title,
      description: group.description,
      goal: group.goal,
      image: group.image,
      memberCount: group.memberCount,
      progress: group.progress,
      createdAt: group.createdAt,
      requirementCount: group.requirements?.length ?? 0,
      milestoneCount: group.milestones?.length ?? 0,
    };
  }
}

