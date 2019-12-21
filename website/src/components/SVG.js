import React from "react";

function SVG({ children, title, ...props }) {
  return (
    <svg {...props}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export default SVG;
