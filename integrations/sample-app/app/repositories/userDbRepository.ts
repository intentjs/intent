import { Injectable } from '@intentjs/core';
import { UserModel } from '../models/userModel.js';
import { DatabaseRepository, InjectModel } from '@intentjs/core/db';

@Injectable()
export class UserDbRepository extends DatabaseRepository<UserModel> {
  @InjectModel(UserModel)
  declare model: UserModel;
}
