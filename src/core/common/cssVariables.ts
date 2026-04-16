import { normalizeCssVariablePrefix, sanitizeIdentifierSegment } from "./css";

export type CssVariableMap = Record<string, string>;

export type CssVariableContext<TKey extends string, TToken> = {
  name: TKey;
  token: TToken;
  formatName: (segment: string) => string;
  prefix: string;
};

export type CssVariableMapper<TKey extends string, TToken> = (
  context: CssVariableContext<TKey, TToken>,
) => CssVariableMap;

export type CssVariableGeneratorOptions<TKey extends string, TToken> = {
  prefix?: string;
  formatName?: (name: TKey) => string;
  mapToken?: CssVariableMapper<TKey, TToken>;
};

const defaultMapper = <TKey extends string, TToken extends { value: string }>(
  context: CssVariableContext<TKey, TToken>,
): CssVariableMap => {
  const varName = `${context.prefix}-${context.formatName(context.name)}`;
  return { [varName]: context.token.value };
};

export const generateCssVariables = <TKey extends string, TToken>(
  tokens: Record<TKey, TToken>,
  options: CssVariableGeneratorOptions<TKey, TToken> = {},
): CssVariableMap => {
  const prefix = normalizeCssVariablePrefix(options.prefix);
  const formatName = options.formatName
    ? (segment: string) => options.formatName!(segment as TKey)
    : sanitizeIdentifierSegment;
  const mapToken = options.mapToken ?? (defaultMapper as CssVariableMapper<TKey, TToken>);
  const variables: CssVariableMap = {};

  (Object.keys(tokens) as TKey[]).forEach(name => {
    const token = tokens[name];
    const context: CssVariableContext<TKey, TToken> = {
      name,
      token,
      prefix,
      formatName,
    };
    Object.assign(variables, mapToken(context));
  });

  return variables;
};
