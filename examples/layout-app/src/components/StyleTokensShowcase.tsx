import type { ReactNode } from "react";
import styled from "styled-components";
import { useTheme } from "styled-components";
import { TokenGrid, TokenChip, Label, Value } from "./TokenGrid";

type StyleValueKey = "marginY" | "marginX" | "paddingY" | "paddingX" | "gap";

type StyleTokenValue = {
  value: string;
  responsive: Array<{ breakpoint: string; query: string; value: string }>;
};

type StyleDefinition = {
  values: Partial<Record<StyleValueKey, StyleTokenValue>>;
};

const FIELDS: Array<{ key: StyleValueKey; label: string }> = [
  { key: "marginY", label: "Margin Y" },
  { key: "marginX", label: "Margin X" },
  { key: "paddingY", label: "Padding Y" },
  { key: "paddingX", label: "Padding X" },
  { key: "gap", label: "Gap" },
];

const PreviewShell = styled.div<{ group: string; variant: string }>`
  margin-top: 12px;
  border-radius: 16px;
  background: #edf1ff;
  border: 1px dashed rgba(34, 81, 255, 0.35);
  width: 100%;
  box-sizing: border-box;
  ${({ theme, group, variant }) => theme.layoutStyleMixin(group, variant)}
`;

const PreviewBlock = styled.div`
  border-radius: 12px;
  border: 1px dashed rgba(34, 81, 255, 0.25);
  background: #fff;
  padding: 16px;
`;

const PreviewLabel = styled.span`
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #2251ff;
  font-size: 11px;
  margin-bottom: 8px;
`;

const GapPreview = styled.div<{ gap: string }>`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ gap }) => gap};
`;

const GapCell = styled.div`
  height: 18px;
  border-radius: 8px;
  background: linear-gradient(120deg, #2251ff, #7f86ff);
`;

const ValueList = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 6px;
`;

const PropertyValue = styled.span`
  font-size: 12px;
  color: #4a4a68;
`;

const PreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewRow = styled.div`
  height: 12px;
  border-radius: 999px;
  background: rgba(34, 81, 255, 0.28);
`;

export const StyleTokensShowcase = () => {
  const theme = useTheme();
  const styles = theme.layoutTokens?.styles ?? {};

  const entries = Object.entries(styles).flatMap(([group, variants]) =>
    Object.keys(variants).map(variant => ({ group, variant })),
  );

  return (
    <TokenGrid>
      {entries.map(({ group, variant }) => {
        const definition = theme.layoutStyle(group, variant) as StyleDefinition | undefined;
        const mixinAvailable = Boolean(definition);
        const gapValue = definition?.values?.gap?.value;
        const propertyDetails = FIELDS.reduce<ReactNode[]>((acc, field) => {
          const token = definition?.values?.[field.key];
          if (!token) {
            return acc;
          }
          const responsiveCount = token.responsive?.length ?? 0;
          const responsiveLabel = responsiveCount ? ` (+${responsiveCount} responsive)` : "";
          acc.push(
            <PropertyValue key={`${group}-${variant}-${field.key}`}>
              {field.label}: {token.value}
              {responsiveLabel}
            </PropertyValue>,
          );
          return acc;
        }, []);
        const propertyCount = propertyDetails.length;

        return (
          <TokenChip key={`${group}-${variant}`}>
            <Label>
              {group}.{variant}
            </Label>
            <Value>{mixinAvailable ? `${propertyCount} properties` : "Missing"}</Value>
            {mixinAvailable && (
              <>
                <PreviewShell group={group} variant={variant}>
                  <PreviewBlock>
                    <PreviewLabel>Preview</PreviewLabel>
                    <PreviewContent>
                      <PreviewRow />
                      <PreviewRow />
                      <PreviewRow />
                    </PreviewContent>
                    {gapValue && (
                      <GapPreview gap={gapValue}>
                        <GapCell />
                        <GapCell />
                        <GapCell />
                      </GapPreview>
                    )}
                  </PreviewBlock>
                </PreviewShell>
                {propertyCount > 0 && <ValueList>{propertyDetails}</ValueList>}
              </>
            )}
          </TokenChip>
        );
      })}
    </TokenGrid>
  );
};
