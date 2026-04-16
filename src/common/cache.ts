export type DependencyCache<TKey extends object, TValue> = {
  get: (dependency: TKey, factory: () => TValue) => TValue;
  peek: (dependency: TKey) => TValue | undefined;
  set: (dependency: TKey, value: TValue) => void;
  clear: (dependency: TKey) => void;
};

export const createDependencyCache = <TKey extends object, TValue>(): DependencyCache<TKey, TValue> => {
  const map = new WeakMap<TKey, TValue>();

  return {
    get(dependency: TKey, factory: () => TValue) {
      const cached = map.get(dependency);
      if (cached !== undefined) {
        return cached;
      }
      const next = factory();
      map.set(dependency, next);
      return next;
    },
    peek(dependency: TKey) {
      return map.get(dependency);
    },
    set(dependency: TKey, value: TValue) {
      map.set(dependency, value);
    },
    clear(dependency: TKey) {
      map.delete(dependency);
    },
  };
};
