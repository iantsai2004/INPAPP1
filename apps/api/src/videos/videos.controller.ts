import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description?: string;
      playbackUrl: string;
      thumbnail: string;
      durationSec?: number;
      tags?: string[];
      authorId?: string;
    },
  ) {
    return this.videosService.create(body);
  }

  @Get('recommendations')
  recommendations(@Query('base') base?: string) {
    return this.videosService.recommendations(base);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Get(':id/comments')
  findComments(@Param('id') id: string) {
    return this.videosService.findComments(id);
  }

  @Get(':id/bubbles')
  findBubbles(@Param('id') id: string) {
    return this.videosService.findBubbles(id);
  }

  @Get(':id/recommendations')
  recommendationsById(@Param('id') id: string) {
    return this.videosService.recommendations(id);
  }
}

