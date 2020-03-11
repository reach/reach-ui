import React, { useEffect } from "react";
import { checkStyles } from "@reach/utils";

// The user may want to provide their own ID (maybe there are multiple nav
// menus on a page a use might want to skip at various points in tabbing?).
let defaultId = "reach-skip-nav";

////////////////////////////////////////////////////////////////////////////////

/**
 * SkipNavLink
 *
 * Renders a link that remains hidden until focused to skip to the main content.
 *
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink
 */
export const SkipNavLink: React.FC<SkipNavLinkProps> = ({
  children = "Skip to content",
  contentId,
  ...props
}) => {
  let id = contentId || defaultId;
  useEffect(() => checkStyles("skip-nav"), []);
  return (
    <a
      {...props}
      href={`#${id}`}
      // TODO: Remove in 1.0 (kept for back compat)
      data-reach-skip-link=""
      data-reach-skip-nav-link=""
    >
      {children}
    </a>
  );
};

/**
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-props
 */
export type SkipNavLinkProps = {
  /**
   * Allows you to change the text for your preferred phrase or localization.
   *
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-children
   */
  children?: string | JSX.Element;
  /**
   * An alternative ID for `SkipNavContent`. If used, the same value must be
   * provided to the `id` prop in `SkipNavContent`.
   *
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-contentid
   */
  contentId?: string;
} & Omit<React.HTMLAttributes<HTMLAnchorElement>, "href">;

if (__DEV__) {
  SkipNavLink.displayName = "SkipNavLink";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SkipNavContent
 *
 * Renders a div as the target for the link.
 *
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent
 */
export const SkipNavContent: React.FC<SkipNavContentProps> = ({
  id: idProp,
  ...props
}) => {
  let id = idProp || defaultId;
  return <div {...props} id={id} data-reach-skip-nav-content="" />;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent-props
 */
export type SkipNavContentProps = {
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
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent-children
   */
  children?: React.ReactNode;
  /**
   * An alternative ID. If used, the same value must be provided to the
   * `contentId` prop in `SkipNavLink`.
   *
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent-id
   */
  id?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "id">;

if (__DEV__) {
  SkipNavContent.displayName = "SkipNavContent";
}
