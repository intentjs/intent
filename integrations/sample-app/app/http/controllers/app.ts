import {
  Controller,
  Get,
  Req,
  Request,
  Res,
  Response,
} from '@intentjs/core/rest';
import { OrderPlacedEvent } from '#events/events/sample-event';
import { UserService } from '#services/index';

@Controller('')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async getHello(@Req() req: Request, @Res() res: Response) {
    return res.json({ hello: 'Intent2' });
  }

  @Get('hello/')
  async getHello2(@Req() req: Request) {
    const order = { id: 123, product: 'A book' };
    const event = new OrderPlacedEvent(order);
    event.emit();
    return { hello: 'Intent2' };
  }
}
