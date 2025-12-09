import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from '../seed';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeed() {
    await seedDatabase(this.prisma);
  }

  async findOne(id: string) {
    await this.ensureSeed();
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        videos: { orderBy: { createdAt: 'desc' } },
        favorites: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
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
    };
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

  private parseTags(tags: string | null): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags as string[];
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
}

