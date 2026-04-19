export type CssDeclaration = {
  property: string;
  value: string | number;
  /** CSS variable name this value references (e.g. "--app-colors-primary"). */
  ref?: string;
  /** Resolved raw value (e.g. "#4dabf7"). Available when the declaration references a variable. */
  resolved?: string | number;
};

export type CssVariablesNode = {
  kind: "variables";
  selector: string;
  media?: string;
  variables: Record<string, string>;
};

export type CssRuleNode = {
  kind: "rule";
  selector: string;
  media?: string;
  declarations: CssDeclaration[];
};

export type CssNode = CssVariablesNode | CssRuleNode;
