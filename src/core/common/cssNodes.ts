export type CssDeclaration = {
  property: string;
  value: string | number;
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
