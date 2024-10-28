import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('signup')
  async signup(@Body() data: signup): Promise<string> {
    return await this.appService.createUser(data);
  }
}
