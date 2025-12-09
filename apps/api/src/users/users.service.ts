import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from '../seed';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeed() {
    await seedDatabase(this.prisma);
  }

  async findAll(limit = 20) {
    await this.ensureSeed();
    const users = await this.prisma.user.findMany({
      include: { videos: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.mapUser(u));
  }

  async findOne(id: string) {
    await this.ensureSeed();
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        videos: { orderBy: { createdAt: 'desc' }, include: { author: true } },
        favorites: { include: { user: true } },
        groupMembers: { include: { group: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      email: user.email,
      createdAt: user.createdAt,
      videos: user.videos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        thumbnail: v.thumbnail,
        durationSec: v.durationSec ?? undefined,
        tags: this.parseTags(v.tags),
        stats: { views: v.views, likes: v.likes, comments: v.commentsCount },
      })),
      favorites: user.favorites.map((f) => ({
        targetId: f.targetId,
        targetType: f.targetType,
      })),
      groups: user.groupMembers.map((gm) => ({
        groupId: gm.group.id,
        groupTitle: gm.group.title,
        status: gm.status,
      })),
    };
  }

  async create(data: { name: string; email?: string; password?: string; avatar?: string; bio?: string }) {
    await this.ensureSeed();
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: data.avatar,
        bio: data.bio,
      },
    });
    return this.mapUser(user);
  }

  async update(
    userId: string,
    data: { name?: string; avatar?: string; bio?: string; email?: string },
  ) {
    await this.ensureSeed();
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.mapUser(user);
  }

  async addFavorite(userId: string, targetType: string, targetId: string) {
    await this.ensureSeed();
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await this.prisma.favorite.upsert({
      where: {
        userId_targetId_targetType: {
          userId,
          targetId,
          targetType,
        },
      },
      update: {},
      create: {
        userId,
        targetId,
        targetType,
      },
    });
    return { ok: true };
  }

  async removeFavorite(userId: string, targetType: string, targetId: string) {
    await this.ensureSeed();
    await this.prisma.favorite.deleteMany({
      where: { userId, targetId, targetType },
    });
    return { ok: true };
  }

  async recordWatch(userId: string, videoId: string) {
    await this.ensureSeed();
    await this.prisma.watchHistory.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: { watchedAt: new Date() },
      create: { userId, videoId },
    });
    return { ok: true };
  }

  async getWatchHistory(userId: string, limit = 20) {
    await this.ensureSeed();
    const history = await this.prisma.watchHistory.findMany({
      where: { userId },
      include: { video: { include: { author: true } } },
      orderBy: { watchedAt: 'desc' },
      take: limit,
    });
    return history.map((h) => ({
      videoId: h.video.id,
      title: h.video.title,
      thumbnail: h.video.thumbnail,
      watchedAt: h.watchedAt,
      author: h.video.author?.name,
    }));
  }

  private mapUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  private parseTags(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags as string[];
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

