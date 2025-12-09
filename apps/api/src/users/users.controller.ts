import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.usersService.findAll(limit ? parseInt(limit) : 20);
  }

  @Post()
  create(@Body() body: { name: string; email?: string; password?: string; avatar?: string; bio?: string }) {
    return this.usersService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; avatar?: string; bio?: string; email?: string }) {
    return this.usersService.update(id, body);
  }

  @Post(':id/favorites')
  addFavorite(
    @Param('id') id: string,
    @Body() body: { targetType: string; targetId: string },
  ) {
    return this.usersService.addFavorite(id, body.targetType, body.targetId);
  }

  @Delete(':id/favorites/:targetType/:targetId')
  removeFavorite(
    @Param('id') id: string,
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.usersService.removeFavorite(id, targetType, targetId);
  }

  @Post(':id/watch')
  recordWatch(@Param('id') id: string, @Body() body: { videoId: string }) {
    return this.usersService.recordWatch(id, body.videoId);
  }

  @Get(':id/watch-history')
  getWatchHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.usersService.getWatchHistory(id, limit ? parseInt(limit) : 20);
  }
}

