import React, { useEffect } from "react";
import { checkStyles } from "@reach/utils";

let id = "reach-skip-nav";

////////////////////////////////////////////////////////////////////////////////
// SkipNavLink

export function SkipNavLink({ children = "Skip to content", ...props }) {
  useEffect(() => checkStyles("skip-nav"));
  return (
    <a {...props} href={`#${id}`} data-reach-skip-link>
      {children}
    </a>
  );
}

SkipNavLink.displayName = "SkipNavLink";

////////////////////////////////////////////////////////////////////////////////
// SkipNavContent

export const SkipNavContent = props => <div {...props} id={id} />;

SkipNavContent.displayName = "SkipNavContent";
