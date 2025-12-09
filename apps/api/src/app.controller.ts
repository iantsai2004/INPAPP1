import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return {
      name: 'Bubble API',
      version: '0.1.0',
      description: '自我實現共學應用',
      endpoints: {
        videos: 'GET /videos',
        comments: 'GET /comments',
        groups: 'GET /groups',
        users: 'GET /users'
      }
    };
  }
}
