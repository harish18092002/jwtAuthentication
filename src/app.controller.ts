import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TLogin, TSignup } from './interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('signup')
  async signup(@Body() data: TSignup) {
    return await this.appService.createUser(data);
  }

  @Post('login')
  async login(@Body() data: TLogin) {
    return await this.appService.loginUser(data);
  }
}
