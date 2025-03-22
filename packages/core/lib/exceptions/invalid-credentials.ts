import { HttpStatus } from '../rest/http-server/status-codes.js';
import { HttpException } from './http-exception.js';

export class InvalidCredentials extends HttpException {
  constructor() {
    super('Invalid Credentials', HttpStatus.UNAUTHORIZED);
  }
}
