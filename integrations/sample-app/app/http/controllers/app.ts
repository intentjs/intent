import { Controller, Get, Req } from '@intentjs/core';
import { UserService } from 'app/services';

@Controller()
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async getHello(@Req() req: Request) {
    return { hello: 'Intent' };
  }

  @Get('hello/')
  async getHello2(@Req() req: Request) {
    return { hello: 'Intent2' };
  }
}
