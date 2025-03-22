import {
  ForClassMethod,
  Model,
  PartialModelObject,
  QueryBuilder,
} from 'objection';
import { CustomQueryBuilder } from './custom.js';

export class SoftDeleteQueryBuilder<
  M extends Model,
  R = M[],
> extends CustomQueryBuilder<M, R> {
  static forClass: ForClassMethod = modelClass => {
    const qb = QueryBuilder.forClass.call(this, modelClass);
    qb.onBuild(builder => {
      const tableName = builder.tableRefFor(modelClass as any);
      if (!builder.context().withArchived) {
        builder.whereNull(`${tableName}.deleted_at`);
      }
    });
    return qb as any;
  };

  withArchived() {
    this.context().withArchived = true;
    return this;
  }

  softDelete() {
    return this.patch({
      deletedAt: new Date(),
    } as unknown as PartialModelObject<M>);
  }
}
