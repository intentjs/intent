import { Str } from '../../utils/string';

export class InvalidMailProviderException extends Error {
  constructor(channel: string) {
    super(`Channel ${channel} is not a valid name.`);
  }
}
