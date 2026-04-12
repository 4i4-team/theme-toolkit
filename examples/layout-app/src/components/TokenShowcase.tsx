import styled from "styled-components";
import type { LayoutTokens } from "@4i4/theme-toolkit/layout";

const TokenContainer = styled.div`
  margin-top: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 16px;
  max-height: 420px;
  overflow: auto;
  font-family: "IBM Plex Mono", monospace;
  font-size: 13px;
  color: #1d1d1f;
`;

interface Props {
  tokens?: LayoutTokens<string>;
}

export const TokenShowcase = ({ tokens }: Props) => {
  if (!tokens) {
    return null;
  }

  return (
    <TokenContainer>
      <pre>{JSON.stringify(tokens, null, 2)}</pre>
    </TokenContainer>
  );
};
