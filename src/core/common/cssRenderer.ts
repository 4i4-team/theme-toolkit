import type { CssVariableMap } from "./cssVariables";

export type CssVariableSection = {
  selector?: string;
  variables: CssVariableMap;
};

export type RenderCssVariablesOptions = {
  defaultSelector?: string;
  indent?: string;
  newline?: string;
};

const DEFAULT_SELECTOR = ":root";
const DEFAULT_INDENT = "  ";
const DEFAULT_NEWLINE = "\n";

export const renderAllCssVariables = (
  sections: CssVariableSection[],
  options: RenderCssVariablesOptions = {},
): string => {
  const indent = options.indent ?? DEFAULT_INDENT;
  const newline = options.newline ?? DEFAULT_NEWLINE;
  const defaultSelector = options.defaultSelector ?? DEFAULT_SELECTOR;

  return sections
    .map(section => {
      const selector = section.selector ?? defaultSelector;
      const body = renderSectionBody(section.variables, indent, newline);
      if (!body) {
        return "";
      }
      return `${selector} {${newline}${body}${newline}}`;
    })
    .filter(Boolean)
    .join(`${newline}${newline}`);
};

const renderSectionBody = (
  variables: CssVariableMap,
  indent: string,
  newline: string,
): string => {
  const entries = Object.entries(variables);
  if (!entries.length) {
    return "";
  }
  return entries
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join(newline);
};
