/**
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs   https://reacttraining.com/reach-ui/portal
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/portal
 * @see React  https://reactjs.org/docs/portals.html
 */

import * as React from "react";

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

/**
 * @see Docs https://reacttraining.com/reach-ui/portal#portal
 */
declare const Portal: React.FunctionComponent<PortalProps>;

export default Portal;
