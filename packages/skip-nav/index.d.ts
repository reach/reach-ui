declare module "@reach/skip-nav" {
  import * as React from "react";

  export type SkipNavProps = {
    children: string | JSX.Element;
  } & Omit<React.HTMLProps<HTMLAnchorElement>, "href">;

  export type SkipNavContentProps = Omit<React.HTMLProps<HTMLDivElement>, "id">;

  export const SkipNavLink: React.FunctionComponent<SkipNavProps>;

  export const SkipNavContent: React.FunctionComponent<SkipNavContentProps>;
}
