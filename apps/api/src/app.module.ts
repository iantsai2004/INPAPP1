import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { VideosModule } from './videos/videos.module';
import { GroupsModule } from './groups/groups.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [PrismaModule, VideosModule, GroupsModule, UsersModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
