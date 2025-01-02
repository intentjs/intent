import { HttpStatus } from '../rest/http-server/status-codes';
import { HttpException } from './http-exception';

export class RouteNotFoundException extends HttpException {
  constructor(response: string | Record<string, any>) {
    super(response, HttpStatus.NOT_FOUND);
  }
}
