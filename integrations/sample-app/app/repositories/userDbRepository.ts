import { DatabaseRepository, Injectable, InjectModel } from '@intentjs/core';
import { UserModel } from '../models/userModel.js';

@Injectable()
export class UserDbRepository extends DatabaseRepository<UserModel> {
  @InjectModel(UserModel)
  declare model: UserModel;
}
