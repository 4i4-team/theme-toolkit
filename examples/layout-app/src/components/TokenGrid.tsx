import styled from "styled-components";

export const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

export const TokenChip = styled.div`
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
`;

export const Label = styled.span`
  font-weight: 600;
  margin-bottom: 4px;
`;

export const Value = styled.span`
  font-size: 14px;
  color: #4a4a68;
`;
