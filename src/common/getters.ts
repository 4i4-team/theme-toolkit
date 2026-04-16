import { createDependencyCache } from "./cache";

export type CachedGetterOptions<TTarget extends object, TDependency extends object, TValue> = {
  key: string | symbol;
  getDependency: (target: TTarget) => TDependency;
  createValue: (dependency: TDependency, target: TTarget) => TValue;
  enumerable?: boolean;
};

export const defineCachedGetter = <
  TTarget extends object,
  TDependency extends object,
  TValue,
>(
  target: TTarget,
  { key, getDependency, createValue, enumerable = true }: CachedGetterOptions<
    TTarget,
    TDependency,
    TValue
  >,
): void => {
  const cache = createDependencyCache<TDependency, TValue>();

  Object.defineProperty(target, key, {
    get() {
      const dependency = getDependency(this as TTarget);
      return cache.get(dependency, () => createValue(dependency, this as TTarget));
    },
    enumerable,
    configurable: true,
  });
};
