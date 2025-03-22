import {
  Accepts,
  BufferBody,
  Controller,
  Dto,
  File,
  findProjectRoot,
  Get,
  Header,
  Host,
  IP,
  Param,
  Post,
  Query,
  Req,
  Res,
  Response,
  StreamableFile,
  UseGuards,
  UserAgent,
} from '@intentjs/core';
import { CustomGuard } from '#http/guards/custom';
import { createReadStream } from 'fs';
import { join } from 'path';
import { LoginDto } from '#validators/auth';

@Controller('/icon')
@UseGuards(CustomGuard)
export class IntentController {
  public service: any;

  constructor() {
    this.service = null;
  }

  @Get('/:name')
  @UseGuards(CustomGuard)
  async getHello(
    // @Req() req: Request,
    // @Param('name') name: string,
    // @Query() query: Record<string, any>,
    // @Query('b') bQuery: string,
    // @Param() pathParams: string,
    // @Host() hostname: string,
    // @IP() ips: string,
    // @Accepts() accepts: string,
    // @BufferBody() bufferBody: Promise<Buffer>,
    // @UserAgent() userAgent: string,
    // @Header() headers: Record<string, any>,
    @Res() res: Response,
  ) {
    // console.log(
    //   'query ==> ',
    //   query,
    //   'bQuyery ==> ',
    //   bQuery,
    //   'name ===> ',
    //   name,
    //   bufferBody,
    //   pathParams,
    //   'hostname===> ',
    //   hostname,
    //   'accepts ===> ',
    //   accepts,
    //   'ips ===> ',
    //   ips,
    //   'inside get method',
    //   'user agent ===> ',
    //   userAgent,
    // );
    // console.log('all headers ===> ', headers);
    // throw new Error('hello there');
    // return { hello: 'world' };
    // const readStream = createReadStream(
    //   join(findProjectRoot(), 'storage/uploads/sample-image.jpg'),
    // );
    // return new StreamableFile(readStream, { type: 'image/jpeg' });
  }

  @Get('/plain-with-query-param')
  @UseGuards(CustomGuard)
  async plainWithQueryParam(@Req() req: Request) {
    console.log(req);
    return { hello: 'world' };
  }

  @Get('/:id')
  @UseGuards(CustomGuard)
  async plainWithPathParam(@Req() req: Request) {
    console.log(req);
    return { hello: 'world' };
  }

  // @Validate(LoginDto)
  @UseGuards(CustomGuard)
  @Post('/json')
  async postJson(
    @Req() req: Request,
    @Dto() dto: LoginDto,
    @Param('name') name: string,
    @Query() query: Record<string, any>,
    @Query('b') bQuery: string,
    @Param() pathParams: string,
    @Host() hostname: string,
    @IP() ips: string,
    @Accepts() accepts: string,
    @BufferBody() bufferBody: Promise<Buffer>,
    @UserAgent() userAgent: string,
    @Header() headers: Record<string, any>,
    // @File('file') file: UploadedFile,
    @Res() res: Response,
  ) {
    // console.log(
    //   'query ==> ',
    //   query,
    //   'bQuyery ==> ',
    //   bQuery,
    //   'name ===> ',
    //   name,
    //   bufferBody,
    //   pathParams,
    //   'hostname===> ',
    //   hostname,
    //   'accepts ===> ',
    //   accepts,
    //   'ips ===> ',
    //   ips,
    //   'inside get method',
    //   'user agent ===> ',
    //   userAgent,
    // );

    const readStream = createReadStream(
      join(findProjectRoot(), 'storage/uploads/sample-image.jpg'),
    );

    return new StreamableFile(readStream, { type: 'image/jpeg' });

    return { hello: 'world from POST /json' };
  }

  @Post('/multipart')
  @UseGuards(CustomGuard)
  async postHello(@Req() req: Request) {
    return { hello: 'world' };
  }

  @Post('/form-data')
  @UseGuards(CustomGuard)
  async postFormData(@Req() req: Request) {
    return { hello: 'world' };
  }

  @Post('/binary')
  @UseGuards(CustomGuard)
  async postBinary(@Req() req: Request) {
    return { hello: 'world' };
  }
}
