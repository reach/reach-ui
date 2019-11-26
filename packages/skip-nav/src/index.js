import React from "react";

let id = "reach-skip-nav";

////////////////////////////////////////////////////////////////////////////////
// SkipNavLink

export function SkipNavLink({ children = "Skip to content", ...props }) {
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
