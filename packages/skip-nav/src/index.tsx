import * as React from "react";
import { forwardRefWithAs, useCheckStyles } from "@reach/utils";

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
const SkipNavLink = forwardRefWithAs<SkipNavLinkProps, "a">(
  function SkipNavLink(
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
  }
);

/**
 * @see Docs https://reach.tech/skip-nav#skipnavlink-props
 */
type SkipNavLinkProps = {
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
};

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
const SkipNavContent = forwardRefWithAs<SkipNavContentProps, "div">(
  function SkipNavContent(
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
  }
);

/**
 * @see Docs https://reach.tech/skip-nav#skipnavcontent-props
 */
type SkipNavContentProps = {
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
};

if (__DEV__) {
  SkipNavContent.displayName = "SkipNavContent";
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { SkipNavContentProps, SkipNavLinkProps };
export { SkipNavLink, SkipNavContent };
