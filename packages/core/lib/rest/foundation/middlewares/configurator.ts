import { Type } from '../../../interfaces';
import { HttpMethods } from '../../http-server/interfaces';
import { IntentMiddleware } from './middleware';

type MiddlewareRuleApplicationInfo =
  | string
  | Type<any>
  | { path: string; method: HttpMethods };

export class MiddlewareConfigurator {
  private rules: { [key: string]: MiddlewareRule } = {};

  use(middleware: Type<IntentMiddleware>): MiddlewareRule {
    if (this.rules[middleware.name]) {
      return this.rules[middleware.name];
    }

    const rule = new MiddlewareRule(middleware);
    this.rules[middleware.name] = rule;
    return rule;
  }

  hasAnyRule(): boolean {
    return !!Object.keys(this.rules).length;
  }

  getAllRules(): MiddlewareRule[] {
    return Object.values(this.rules);
  }
}

export class MiddlewareRule {
  public appliedFor: Array<MiddlewareRuleApplicationInfo> = [];
  public excludedFor: Array<string | { path: string; method: HttpMethods }> =
    [];

  constructor(public middleware: Type<IntentMiddleware>) {}

  for(...path: MiddlewareRuleApplicationInfo[]): this {
    this.appliedFor.push(...path);
    return this;
  }

  exclude(
    ...path: Array<string | { path: string; method: HttpMethods }>
  ): this {
    this.excludedFor.push(...path);
    return this;
  }
}
