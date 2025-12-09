import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.groupsService.findAll(limit ? parseInt(limit) : 20);
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description?: string;
      goal?: string;
      image?: string;
      requirementVideoIds?: string[];
    },
  ) {
    return this.groupsService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.groupsService.joinGroup(id, body.userId);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.groupsService.leaveGroup(id, body.userId);
  }

  @Post(':id/milestones')
  addMilestone(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string; targetDate?: string },
  ) {
    return this.groupsService.addMilestone(id, body);
  }

  @Post('/milestones/:milestoneId/status')
  updateMilestoneStatus(
    @Param('milestoneId') milestoneId: string,
    @Body() body: { status: 'planned' | 'in_progress' | 'done' },
  ) {
    return this.groupsService.updateMilestoneStatus(parseInt(milestoneId), body.status);
  }

  @Post('/milestones/:milestoneId/progress')
  addProgressEntry(
    @Param('milestoneId') milestoneId: string,
    @Body() body: { userId: string; note?: string },
  ) {
    return this.groupsService.addProgressEntry(parseInt(milestoneId), body.userId, body.note);
  }
}

