import styled, { css } from "styled-components";

const baseMixin = css`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`;

const defaultMixin = css`
  ${({ theme }) => theme.layoutContainerMixin("default")}
`;

const narrowMixin = css`
  ${({ theme }) => theme.layoutContainerMixin("narrow")}
`;

const wideMixin = css`
  ${({ theme }) => theme.layoutContainerMixin("wide")}
`;

const mixins = {
  default: defaultMixin,
  narrow: narrowMixin,
  wide: wideMixin,
};

export type ContainerType = keyof typeof mixins;

interface Props {
  variant?: ContainerType;
}

export const Container = styled.div<Props>`
  ${baseMixin}
  ${({ variant = "default" }) => mixins[variant]}
`;
