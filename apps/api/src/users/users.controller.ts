import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
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
}

