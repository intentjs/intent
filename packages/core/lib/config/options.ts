export type RegisterNamespaceOptions = {
  encrypt?: boolean;
};

export type BuildConfigFromNS<
  T extends RegisterNamespaceReturnType<any, any>[],
> = {
  [N in T[number]['_']['namespace']]: Extract<
    T[number],
    { _: { namespace: N } }
  >['$inferConfig'];
};

export type RegisterNamespaceReturnType<
  N extends string,
  T extends Record<string, any>,
> = {
  _: {
    namespace: N;
    options: RegisterNamespaceOptions;
    factory: () => T | Promise<T>;
  };
  $inferConfig: T;
};

export type NamespacedConfigMapKeys = 'factory' | 'static' | 'encrypt';

export type NamespacedConfigMapValues =
  // eslint-disable-next-line @typescript-eslint/ban-types
  Function | object | boolean | string | number;

export type NamespacedConfigMap = Map<
  NamespacedConfigMapKeys,
  NamespacedConfigMapValues
>;

export type ConfigMap = Map<string, NamespacedConfigMap>;
