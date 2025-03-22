import {
  QueryBuilder,
  Model,
  Page,
  OrderByDirection,
  PrimitiveValue,
  Expression,
} from 'objection';
import { GenericFunction } from '../../interfaces/index.js';
import { Pagination } from '../interfaces.js';

export class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<
  M,
  R
> {
  declare ArrayQueryBuilderType: CustomQueryBuilder<M, M[]>;
  declare SingleQueryBuilderType: CustomQueryBuilder<M, M>;
  declare NumberQueryBuilderType: CustomQueryBuilder<M, number>;
  declare PageQueryBuilderType: CustomQueryBuilder<M, Page<M>>;

  async paginate<T>(page: number, perPage: number): Promise<Pagination<T>> {
    page = +page ? +page : 1;
    perPage = +perPage ? +perPage : 15;

    const result = await this.page(page - 1, perPage);
    return {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / perPage),
        perPage,
        total: result.total,
      },
      data: result.results as unknown as T[],
    };
  }

  async allPages<T>(): Promise<Pagination<T>> {
    return { data: (await this) as unknown as T[] };
  }

  async onlyCount() {
    const result = (await this.count({ c: '*' })) as unknown as { c: number }[];
    return +result[0].c;
  }

  async exists() {
    const result = await this.onlyCount();
    return !!result;
  }

  async chunk(cb: GenericFunction, size: number): Promise<void> {
    let offset = 0;
    let hasMore = true;
    while (!offset || hasMore) {
      const query = structuredClone(this);
      const records = (await query
        .offset(offset)
        .limit(size)) as unknown as M[];
      hasMore = !(records.length > 0);
      if (!hasMore) return;
      await cb(records);
      offset += size;
    }
  }

  cOrderBy(expressions: string): this {
    const orders = (expressions || '').split('|');
    for (const order of orders) {
      const [column, direction] = order.split(':');
      if (!column) continue;
      this.orderBy(column, (direction || 'ASC') as OrderByDirection);
    }

    return this;
  }

  when(
    condition: any,
    truthyCb: (query: CustomQueryBuilder<M, R>, condition: any) => this,
    falsyCb?: (query: CustomQueryBuilder<M, R>, condition: any) => this,
  ): this {
    if (condition) {
      return truthyCb(this, condition);
    } else if (falsyCb) {
      return falsyCb(this, condition);
    } else {
      return this;
    }
  }

  safeWhereIn(col: string, expr: Expression<PrimitiveValue>): this {
    if (!Array.isArray(expr)) return this;
    if (Array.isArray(expr) && expr.length < 1) return this;

    return this.whereIn(col, expr);
  }

  safeWhereNotIn(col: string, expr: Expression<PrimitiveValue>): this {
    if (!Array.isArray(expr)) return this;
    if (Array.isArray(expr) && expr.length < 1) return this;

    return this.whereNotIn(col, expr);
  }
}
