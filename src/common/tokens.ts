export type TokenGeneratorContext<TKey extends string, TValue> = {
  name: TKey;
  value: TValue;
};

export type TokenGenerator<TKey extends string, TValue, TToken> = (
  context: TokenGeneratorContext<TKey, TValue>,
) => TToken;

export const generateTokens = <TKey extends string, TValue, TToken>(
  values: Record<TKey, TValue>,
  buildToken: TokenGenerator<TKey, TValue, TToken>,
): Record<TKey, TToken> => {
  const tokens = {} as Record<TKey, TToken>;

  (Object.keys(values) as TKey[]).forEach(name => {
    tokens[name] = buildToken({ name, value: values[name] });
  });

  return tokens;
};
