import { Obj } from '../utils/index.js';
import {
  TransformableContextOptions,
  TransformerContext,
} from './interfaces.js';
import { Transformer } from './transformer.js';

export class Transformable {
  /**
   * Transform a object
   *
   * @param obj
   * @param transformer
   * @param options
   */
  async item(
    obj: Record<string, any>,
    transformer: Transformer,
    options?: TransformableContextOptions,
  ): Promise<Record<string, any>> {
    transformer = this.setTransformerContext(transformer, options);

    return await transformer.work(obj);
  }

  /**
   * Transform collection/array
   *
   * @param collect
   * @param transformer
   * @param options
   */
  async collection(
    collect: Array<Record<string, any>>,
    transformer: Transformer,
    options?: TransformableContextOptions,
  ): Promise<Array<Record<string, any>>> {
    transformer = this.setTransformerContext(transformer, options);

    const collection = [];
    for (const o of collect) {
      collection.push(await transformer.work(o));
    }
    return collection;
  }

  /**
   * Transform with paginate
   * @param obj
   * @param transformer
   * @param options
   */
  async paginate(
    obj: Record<string, any>,
    transformer: Transformer,
    options?: TransformableContextOptions,
  ): Promise<Record<string, any>> {
    const collection = this.collection(obj.data, transformer, options);
    return { data: await collection, pagination: obj.pagination };
  }

  private setTransformerContext(
    transformer: Transformer,
    options: TransformableContextOptions,
  ): Transformer {
    // add request object to the transformer's context
    const ctx = new TransformerContext(options);
    transformer.setContext(ctx);
    return transformer;
  }

  getIncludes(req: any) {
    if (!req) return '';
    return Obj.get(req.all(), 'include', '');
  }
}
