import { Str } from '../../utils/string';

export class ErrorSendingMail extends Error {
  constructor(message: string | Record<string, any>) {
    super(
      Str.isString(message)
        ? (message as string)
        : `There was an error while sending email`,
    );
  }
}
