import { Inject, Injectable } from '../foundation/decorators.js';
import { DotNotation, GetNestedPropertyType } from '../type-helpers/index.js';
import { Obj } from '../utils/object.js';
import { CONFIG_FACTORY } from './constant.js';
import type { ConfigMap, NamespacedConfigMapValues } from './options.js';

type ConfigPaths<T> = DotNotation<T>;

@Injectable()
export class ConfigService<G = undefined> {
  private static cachedConfig = new Map<string, any>();
  private static config: ConfigMap;

  constructor(@Inject(CONFIG_FACTORY) private config: ConfigMap) {
    ConfigService.cachedConfig = new Map<ConfigPaths<G>, any>();
    ConfigService.config = this.config;
  }

  get<P extends string = ConfigPaths<G>, F = any>(
    key: P,
  ): GetNestedPropertyType<G, P, F> | Promise<GetNestedPropertyType<G, P, F>> {
    return ConfigService.get<G, P>(key);
  }

  static get<C = undefined, P extends string = ConfigPaths<C>, F = any>(
    key: P,
  ): GetNestedPropertyType<C, P, F> | Promise<GetNestedPropertyType<C, P, F>> {
    const cachedValue = ConfigService.cachedConfig.get(key);
    if (cachedValue) return cachedValue;

    const [namespace, ...paths] = (key as string).split('.');
    const nsConfig = this.config.get(namespace);
    /**
     * Returns a null value if the namespace doesn't exist.
     */
    if (!nsConfig) return null;

    if (!paths.length) return nsConfig.get('static') as any;

    const staticValues = nsConfig.get('static') as Omit<
      NamespacedConfigMapValues,
      'function'
    >;

    const valueOnPath = Obj.get<any>(staticValues, paths.join('.'));
    if (valueOnPath) {
      this.cachedConfig.set(key as string, valueOnPath);
    }
    return valueOnPath;
  }
}
