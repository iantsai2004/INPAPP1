import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from '../seed';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeed() {
    await seedDatabase(this.prisma);
  }

  async create(data: {
    videoId: string;
    userId?: string;
    body: string;
    parentId?: string;
  }) {
    await this.ensureSeed();
    const comment = await this.prisma.comment.create({
      data,
      include: { user: true },
    });
    return this.mapComment(comment);
  }

  async findAll(videoId: string, parentId?: string | null) {
    await this.ensureSeed();
    const comments = await this.prisma.comment.findMany({
      where: { videoId, parentId: parentId === undefined ? null : parentId },
      orderBy: { likes: 'desc' },
      include: { user: true, replies: { include: { user: true } } },
    });
    return comments.map((c) => this.mapCommentWithReplies(c));
  }

  async findOne(id: string) {
    await this.ensureSeed();
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { user: true, replies: { include: { user: true } } },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.mapCommentWithReplies(comment);
  }

  async delete(id: string) {
    await this.ensureSeed();
    await this.prisma.comment.delete({ where: { id } });
    return { ok: true };
  }

  async like(commentId: string, userId: string) {
    await this.ensureSeed();
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    try {
      await this.prisma.commentLike.create({
        data: { commentId, userId },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { likes: { increment: 1 } },
      });
    } catch (e) {
      // Already liked
    }

    return { ok: true };
  }

  async unlike(commentId: string, userId: string) {
    await this.ensureSeed();
    try {
      await this.prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { likes: { decrement: 1 } },
      });
    } catch (e) {
      // Not liked
    }
    return { ok: true };
  }

  private mapComment(comment: any) {
    return {
      id: comment.id,
      body: comment.body,
      likes: comment.likes,
      createdAt: comment.createdAt,
      userName: comment.user?.name ?? '匿名',
      userAvatar: comment.user?.avatar,
      userId: comment.user?.id,
    };
  }

  private mapCommentWithReplies(comment: any) {
    return {
      ...this.mapComment(comment),
      replies: comment.replies?.map((r: any) => this.mapComment(r)) ?? [],
    };
  }
}
