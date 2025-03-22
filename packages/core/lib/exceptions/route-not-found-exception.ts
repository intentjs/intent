import { HttpStatus } from '../rest/http-server/status-codes.js';
import { HttpException } from './http-exception.js';

export class RouteNotFoundException extends HttpException {
  constructor(response: string | Record<string, any>) {
    super(response, HttpStatus.NOT_FOUND);
  }
}
