import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  margin-top: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 16px;
  align-self: flex-start;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  text-align: left;
  background: ${({ active }) => (active ? "#2251ff" : "#f5f6fb")};
  color: ${({ active }) => (active ? "#fff" : "#1d1d1f")};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
`;

const Panel = styled.div``;

export interface TabConfig {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  tabs: TabConfig[];
}

export const Tabs: React.FC<Props> = ({ tabs }) => {
  const [active, setActive] = React.useState(() => tabs[0]?.id ?? "");
  const current = tabs.find(tab => tab.id === active) ?? tabs[0];

  if (!current) {
    return null;
  }

  return (
    <Container>
      <Sidebar>
        {tabs.map(tab => (
          <TabButton key={tab.id} active={tab.id === current.id} onClick={() => setActive(tab.id)}>
            {tab.label}
          </TabButton>
        ))}
      </Sidebar>
      <Panel>{current.content}</Panel>
    </Container>
  );
};
