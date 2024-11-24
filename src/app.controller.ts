import { Body, Controller, Post, Headers, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { TLogin, TSignup } from './interface';
import { AuthModule } from './auth/auth.module';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('signup')
  async signup(@Body() data: TSignup) {
    return await this.appService.createUser(data);
  }

  @Post('login')
  async login(@Body() data: TLogin, @Headers('authorization') token: string) {
    return await this.appService.loginUser(data, token);
  }
}
