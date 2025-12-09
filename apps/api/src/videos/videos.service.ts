import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from '../seed';

// Simplified types for SQLite
type VideoWithRelations = any;
type GroupWithRequirements = any;

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeed() {
    await seedDatabase(this.prisma);
  }

  async findAll() {
    await this.ensureSeed();
    const videos = await this.prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        comments: { orderBy: { likes: 'desc' }, include: { user: true } },
        author: true,
        requirements: {
          include: {
            group: { include: { milestones: true, requirements: true } },
          },
        },
      },
    });

    return videos.map((video) => this.mapVideo(video));
  }

  async findOne(id: string) {
    await this.ensureSeed();
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { likes: 'desc' }, include: { user: true } },
        author: true,
        requirements: {
          include: {
            group: { include: { milestones: true, requirements: true } },
          },
        },
      },
    });

    if (!video) throw new NotFoundException('Video not found');
    const recommendations = await this.recommendations(id);
    return { ...this.mapVideo(video), recommendations };
  }

  async findComments(id: string) {
    await this.ensureSeed();
    const comments = await this.prisma.comment.findMany({
      where: { videoId: id },
      orderBy: { likes: 'desc' },
      include: { user: true },
    });
    return comments.map((c) => ({
      ...c,
      userName: c.user?.name ?? '匿名',
    }));
  }

  async findBubbles(id: string) {
    await this.ensureSeed();
    const requirements = await this.prisma.groupRequirement.findMany({
      where: { videoId: id },
      include: {
        group: { include: { milestones: true, requirements: true } },
      },
    });
    return requirements.map((req) =>
      this.mapGroup(req.group as GroupWithRequirements),
    );
  }

  async recommendations(baseVideoId?: string, limit = 6) {
    await this.ensureSeed();
    const base = baseVideoId
      ? await this.prisma.video.findUnique({ where: { id: baseVideoId } })
      : null;

    const baseTags = this.parseTags(base?.tags ?? '[]');

    const videos = await this.prisma.video.findMany({
      where: baseVideoId ? { id: { not: baseVideoId } } : undefined,
      include: { author: true },
      orderBy: { views: 'desc' },
    });

    const scored = videos
      .map((v) => {
        const tags = this.parseTags(v.tags);
        const overlap = baseTags.length
          ? tags.filter((t) => baseTags.includes(t)).length
          : 0;
        const score = overlap * 10 + v.views * 0.001;
        return { video: v, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ video }) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      durationSec: video.durationSec ?? undefined,
      tags: this.parseTags(video.tags),
      stats: {
        views: video.views,
        comments: video.commentsCount,
        likes: video.likes,
      },
    }));
  }

  async create(data: {
    title: string;
    description?: string;
    playbackUrl: string;
    thumbnail: string;
    durationSec?: number;
    tags?: string[];
    authorId?: string;
  }) {
    await this.ensureSeed();
    const video = await this.prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        playbackUrl: data.playbackUrl,
        thumbnail: data.thumbnail,
        durationSec: data.durationSec,
        tags: JSON.stringify(data.tags ?? []),
        authorId: data.authorId,
      },
      include: { author: true, comments: true, requirements: true },
    });
    return this.mapVideo({
      ...video,
      requirements: [],
      comments: [],
    } as VideoWithRelations);
  }

  private mapVideo(video: VideoWithRelations) {
    const comments = video.comments.map((c) => ({
      ...c,
      userName: c.user?.name ?? '匿名',
    }));
    const topComment = comments.at(0) ?? null;
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      playbackUrl: video.playbackUrl,
      thumbnail: video.thumbnail,
      durationSec: video.durationSec,
      tags: this.parseTags(video.tags),
      author: video.author
        ? { id: video.author.id, name: video.author.name, avatar: video.author.avatar }
        : null,
      stats: {
        views: video.views,
        likes: video.likes,
        comments: video.commentsCount ?? comments.length,
      },
      topComment,
      comments,
      bubbles: video.requirements.map((req) =>
        this.mapGroup(req.group as GroupWithRequirements),
      ),
    };
  }

  private mapGroup(group: GroupWithRequirements) {
    return {
      id: group.id,
      title: group.title,
      goal: group.goal,
      memberCount: group.memberCount,
      progress: group.progress,
      requirementVideos: group.requirements?.map((r) => r.videoId) ?? [],
      milestones: group.milestones?.map((m) => m.title) ?? [],
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

