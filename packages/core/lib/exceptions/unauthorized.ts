import { HttpStatus } from '../rest/http-server/status-codes.js';
import { HttpException } from './http-exception.js';

export class Unauthorized extends HttpException {
  constructor() {
    super('Unauthorized.', HttpStatus.UNAUTHORIZED);
  }
}
