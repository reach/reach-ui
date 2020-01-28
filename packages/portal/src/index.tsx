/**
 * Welcome to @reach/portal!
 *
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs   https://reacttraining.com/reach-ui/portal
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/portal
 * @see React  https://reactjs.org/docs/portals.html
 */

import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Portal
 *
 * @see Docs https://reacttraining.com/reach-ui/portal#portal
 */
const Portal: React.FC<PortalProps> = ({ children, type = "reach-portal" }) => {
  let mountNode = useRef<HTMLDivElement | null>(null);
  let portalNode = useRef<HTMLElement | null>(null);
  let [, forceUpdate] = useState();

  useLayoutEffect(() => {
    // It's possible that the content we are portal has, itself, been portaled.
    // In that case, it's important to append to the correct document element.
    const ownerDocument = mountNode.current!.ownerDocument;
    portalNode.current = ownerDocument?.createElement(type)!;
    ownerDocument!.body.appendChild(portalNode.current);
    forceUpdate({});
    return () => {
      if (portalNode.current && portalNode.current.ownerDocument) {
        portalNode.current.ownerDocument.body.removeChild(portalNode.current);
      }
    };
  }, [type]);

  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <div ref={mountNode} />
  );
};

/**
 * @see Docs https://reacttraining.com/reach-ui/portal#portal-props
 */
export type PortalProps = {
  /**
   * Regular React children.
   *
   * @see Docs https://reacttraining.com/reach-ui/portal#portal-children
   */
  children: React.ReactNode;
  /**
   * The DOM element type to render.
   *
   * @see Docs https://reacttraining.com/reach-ui/portal#portal-type
   */
  type?: string;
};

if (__DEV__) {
  Portal.displayName = "Portal";
}

export default Portal;
