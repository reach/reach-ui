import * as React from "react";
import { useCheckStyles } from "@reach/utils/dev-utils";

import type * as Polymorphic from "@reach/utils/polymorphic";

// The user may want to provide their own ID (maybe there are multiple nav
// menus on a page a use might want to skip at various points in tabbing?).
let defaultId = "reach-skip-nav";

////////////////////////////////////////////////////////////////////////////////

/**
 * SkipNavLink
 *
 * Renders a link that remains hidden until focused to skip to the main content.
 *
 * @see Docs https://reach.tech/skip-nav#skipnavlink
 */
const SkipNavLink = React.forwardRef(function SkipNavLink(
  { as: Comp = "a", children = "Skip to content", contentId, ...props },
  forwardedRef
) {
  let id = contentId || defaultId;
  useCheckStyles("skip-nav");
  return (
    <Comp
      {...props}
      ref={forwardedRef}
      href={`#${id}`}
      // TODO: Remove in 1.0 (kept for back compat)
      data-reach-skip-link=""
      data-reach-skip-nav-link=""
    >
      {children}
    </Comp>
  );
}) as Polymorphic.ForwardRefComponent<"a", SkipNavLinkProps>;

/**
 * @see Docs https://reach.tech/skip-nav#skipnavlink-props
 */
interface SkipNavLinkProps {
  /**
   * Allows you to change the text for your preferred phrase or localization.
   *
   * @see Docs https://reach.tech/skip-nav#skipnavlink-children
   */
  children?: React.ReactNode;
  /**
   * An alternative ID for `SkipNavContent`. If used, the same value must be
   * provided to the `id` prop in `SkipNavContent`.
   *
   * @see Docs https://reach.tech/skip-nav#skipnavlink-contentid
   */
  contentId?: string;
}

if (__DEV__) {
  SkipNavLink.displayName = "SkipNavLink";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SkipNavContent
 *
 * Renders a div as the target for the link.
 *
 * @see Docs https://reach.tech/skip-nav#skipnavcontent
 */
const SkipNavContent = React.forwardRef(function SkipNavContent(
  { as: Comp = "div", id: idProp, ...props },
  forwardedRef
) {
  let id = idProp || defaultId;
  return (
    <Comp
      {...props}
      ref={forwardedRef}
      id={id}
      data-reach-skip-nav-content=""
    />
  );
}) as Polymorphic.ForwardRefComponent<"div", SkipNavContentProps>;

/**
 * @see Docs https://reach.tech/skip-nav#skipnavcontent-props
 */
interface SkipNavContentProps {
  /**
   * You can place the `SkipNavContent` element as a sibling to your main
   * content or as a wrapper.
   *
   * Keep in mind it renders a `div`, so it may mess with your CSS depending on
   * where it’s placed.
   *
   * @example
   *   <SkipNavContent />
   *   <YourMainContent />
   *   // vs.
   *   <SkipNavContent>
   *     <YourMainContent/>
   *   </SkipNavContent>
   *
   * @see Docs https://reach.tech/skip-nav#skipnavcontent-children
   */
  children?: React.ReactNode;
  /**
   * An alternative ID. If used, the same value must be provided to the
   * `contentId` prop in `SkipNavLink`.
   *
   * @see Docs https://reach.tech/skip-nav#skipnavcontent-id
   */
  id?: string;
}

if (__DEV__) {
  SkipNavContent.displayName = "SkipNavContent";
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { SkipNavContentProps, SkipNavLinkProps };
export { SkipNavLink, SkipNavContent };
