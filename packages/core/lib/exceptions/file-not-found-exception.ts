import { HttpStatus } from '../rest/http-server/status-codes.js';
import { HttpException } from './http-exception.js';

export class FileNotFoundException extends HttpException {
  constructor(
    response: string | Record<string, any>,
    status: number | HttpStatus = HttpStatus.NOT_FOUND,
  ) {
    super(response, status);
  }
}
