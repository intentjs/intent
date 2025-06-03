import { OrderPlacedEvent } from '#events/events/sample-event';
import { UserService } from '#services/index';
import {
  Controller,
  Get,
  Req,
  Request,
  Res,
  Response,
} from '@intentjs/core/http';
import { ReactRenderer } from '@intentjs/core/frontend';
import { Inject } from '@intentjs/core';

@Controller('')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly reactRenderer: ReactRenderer,
  ) {}

  @Get()
  async getHello(@Req() req: Request, @Res() res: Response) {
    return this.reactRenderer.renderUsingVite('home', req, res);
    // return res.json({ hello: 'Intent2' });
  }

  @Get('contact')
  async contactPage(@Req() req: Request, @Res() res: Response) {
    return this.reactRenderer.render('contact', req, res);
    // return res.json({ hello: 'Intent2' });
  }

  @Get('hello')
  async getHello2(@Req() req: Request) {
    const order = { id: 123, product: 'A book' };
    const event = new OrderPlacedEvent(order);
    event.emit();
    return { hello: 'Intent2' };
  }
}
