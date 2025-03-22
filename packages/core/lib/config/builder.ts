import {
  NamespacedConfigMapKeys,
  NamespacedConfigMapValues,
  RegisterNamespaceReturnType,
} from './options.js';

export class ConfigBuilder {
  static async build(
    namespaceObjects: RegisterNamespaceReturnType<string, any>[],
  ): Promise<Map<string, any>> {
    const configMap = new Map();

    for (const namespacedConfig of namespaceObjects) {
      const namespacedMap = new Map<
        NamespacedConfigMapKeys,
        NamespacedConfigMapValues
      >();
      namespacedMap.set('factory', namespacedConfig._.factory);
      namespacedMap.set('static', await namespacedConfig._.factory());
      namespacedMap.set('encrypt', namespacedConfig._.options.encrypt);
      configMap.set(namespacedConfig._.namespace, namespacedMap);
    }

    return configMap;
  }
}
