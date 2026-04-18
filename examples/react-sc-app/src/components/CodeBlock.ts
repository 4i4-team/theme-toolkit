import styled from "styled-components";

export const CodeBlock = styled.pre`
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  font-size: 0.8rem;
  line-height: 1.5;
  margin-bottom: 16px;
`;

export const Accordion = styled.div`
  margin-bottom: 8px;
`;

export const AccordionButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: #343a40;

  &:hover {
    background: #f8f9fa;
  }
`;
