import { Transformer } from '@intentjs/core';
import { UserModel } from '#models/userModel';

export class UserTransformer extends Transformer {
  async transform(user: UserModel): Promise<Record<string, any> | null> {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      passwordChangedAt: user.passwordChangedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: user.token,
    };
  }
}
