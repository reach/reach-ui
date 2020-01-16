import React from "react";
import VisuallyHidden from "@reach/visually-hidden";

export function TOC({ children, label = "Table of Contents", ...props }) {
  return (
    <nav className="toc" {...props}>
      <VisuallyHidden>
        <h2>{label}</h2>
      </VisuallyHidden>
      {children}
    </nav>
  );
}

export function TOCList({ children, style = {}, ...props }) {
  return (
    <ul
      style={{
        display: "block",
        padding: 0,
        listStyle: "none",
        ...style
      }}
      {...props}
    >
      {children}
    </ul>
  );
}

export function TOCLink({ href, children, ...props }) {
  return (
    <li style={{ display: "inline-block", margin: 0, padding: 0 }}>
      <a href={href} {...props}>
        {children}
      </a>
    </li>
  );
}
