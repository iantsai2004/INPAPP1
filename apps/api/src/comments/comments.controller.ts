import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body()
    body: {
      videoId: string;
      userId?: string;
      body: string;
      parentId?: string;
    },
  ) {
    return this.commentsService.create(body);
  }

  @Get()
  findAll(@Query('videoId') videoId: string, @Query('parentId') parentId?: string) {
    return this.commentsService.findAll(videoId, parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @Body('userId') userId: string) {
    return this.commentsService.like(id, userId);
  }

  @Post(':id/unlike')
  unlike(@Param('id') id: string, @Body('userId') userId: string) {
    return this.commentsService.unlike(id, userId);
  }
}
