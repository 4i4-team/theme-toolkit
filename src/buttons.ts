import { css } from "styled-components";
import { RuleSet } from "styled-components/dist/types";

export function buildButtons<T extends string>(types: T[]): RuleSet<object> {
  return css`
    ${types.map(type => {
      return css`
        &.btn-${type} {
          background-color: var(--color--${type});
          color: var(--text--${type});

          &:hover {
            background-color: var(--color--${type}--dark);
          }

          &-hollow {
            border-color: var(--color--${type});
            background-color: #fff;
            color: var(--color--${type});

            &:hover {
              color: var(--text--${type});
              background-color: var(--color--${type}--dark);
            }
          }

          &-link {
            background-color: transparent;
            color: var(--color--${type});
            padding: 0 !important;

            &:hover {
              color: var(--color--${type}--dark);
              background-color: transparent;
            }
          }
        }
      `;
    })};
  `;
}
