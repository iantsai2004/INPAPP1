import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Post(':id/join')
  join(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    return this.groupsService.joinGroup(id, body.userId);
  }
}

