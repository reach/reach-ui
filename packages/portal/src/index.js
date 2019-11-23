import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function Portal({ children, type = "reach-portal" }) {
  let mountNode = useRef(null);
  let portalNode = useRef(null);
  let [, forceUpdate] = useState();

  useLayoutEffect(() => {
    // It's possible that the content we are portal has, itself, been portaled.
    // In that case, it's important to append to the correct document element.
    const ownerDocument = mountNode.current.ownerDocument;
    portalNode.current = ownerDocument.createElement(type);
    ownerDocument.body.appendChild(portalNode.current);
    forceUpdate({});
    return () => {
      portalNode.current.ownerDocument.body.removeChild(portalNode.current);
    };
  }, [type]);

  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <div ref={mountNode} />
  );
}

Portal.displayName = "Portal";

export default Portal;
