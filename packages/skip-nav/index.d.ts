import * as React from "react";

export type SkipNavProps = {
  children: string | JSX.Element;
} & Omit<React.HTMLProps<HTMLAnchorElement>, "href">;

export type SkipNavContentProps = Omit<React.HTMLProps<HTMLDivElement>, "id">;

declare const SkipNavLink: React.FunctionComponent<SkipNavProps>;

declare const SkipNavContent: React.FunctionComponent<SkipNavContentProps>;
