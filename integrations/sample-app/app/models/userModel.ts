import { BaseModel } from '@intentjs/core';

export class UserModel extends BaseModel {
  static tableName = 'users';

  /**
   * You can define the name of the database connection
   * that should be used for this model.
   *
   * static connection: string;
   */

  /**
   * Set this value as true, if you want to
   * enable soft delete for this model.
   *
   * static softDelete: boolean;
   */

  /**
   * Columns
   */
  declare id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerifiedAt: Date;
  passwordChangedAt: Date;

  /**
   * Computed Properties
   */
  token?: string;
}
