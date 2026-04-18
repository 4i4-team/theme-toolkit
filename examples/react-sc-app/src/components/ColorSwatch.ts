import styled from "styled-components";

export const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

export const Swatch = styled.div<{ $bg: string; $color?: string }>`
  height: 72px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color ?? "#fff"};
  gap: 2px;
`;

export const SwatchLabel = styled.span`
  opacity: 0.8;
  font-weight: 400;
  font-size: 0.65rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
