/**
 * An accessible dropdown menu for the common dropdown menu button design
 * pattern.
 *
 * @see Docs     https://reacttraining.com/reach-ui/menu-button
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/menu-button
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton
 */

import * as React from "react";
import { StyledComponent } from "styled-components";

type ResolvedMenuItemComponent<T> = T extends keyof JSX.IntrinsicElements
  ? T
  : React.ComponentType<ResolvedMenuItemProps<T>>;

type ResolvedMenuItemProps<T> = T extends keyof JSX.IntrinsicElements
  ? Omit<JSX.IntrinsicElements[T], "role">
  : Omit<React.HTMLProps<HTMLDivElement>, "onSelect" | "role">;

type ResolvedMenuLinkComponent<T> = T extends keyof JSX.IntrinsicElements
  ? T
  : React.ComponentType<ResolvedMenuLinkProps<T>>;

type ResolvedMenuLinkProps<T> = T extends keyof JSX.IntrinsicElements
  ? Omit<JSX.IntrinsicElements[T], "role">
  : Omit<React.HTMLProps<HTMLAnchorElement>, "role">;

type SupportedMenuItemComponent = object | keyof JSX.IntrinsicElements;

type SupportedMenuLinkComponent = object | keyof JSX.IntrinsicElements;

export interface MenuItemState {
  buttonId: string;
  buttonRect: undefined | DOMRect;
  closingWithClick: boolean;
  isOpen: boolean;
  selectionIndex: number;
}

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menu-props
 */
export interface MenuProps {
  /**
   * Requires two children: a `<MenuButton>` and a `<MenuList>`.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menu-children
   */
  children: React.ReactNode;
}

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menubutton-props
 */
export type MenuButtonProps = React.HTMLProps<HTMLButtonElement> & {
  /**
   * Accepts any renderable content.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menubutton-children
   */
  children: React.ReactNode;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulist-props
 */
export type MenuListProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Can contain only `MenuItem` or a `MenuLink`.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menulist-children
   */
  children: React.ReactNode;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulink-props
 */
export type MenuLinkProps<
  T extends SupportedMenuLinkComponent = "a"
> = ResolvedMenuLinkProps<T> & {
  /**
   * By default, `MenuLink` renders an anchor, but if you are using a router
   * with its own `Link` component, you can use `as={Link}`.
   *
   * Additionally, if other routers' `Link` component uses the
   * `React.forwardRef` API, you can pass them in as well. If they don’t it
   * won't work because we will not be able to manage focus on the element the
   * component renders.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menulink-as
   */
  as?: ResolvedMenuLinkComponent<T>;
  /**
   * You can render any kind of content inside of a MenuLink.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menulink-children
   */
  children: React.ReactNode;
  to?: string;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem-props
 */
export type MenuItemProps<
  T extends SupportedMenuItemComponent = "div"
> = ResolvedMenuItemProps<T> & {
  /**
   * By default, `MenuItem` renders a div. You can pass another element or use
   * this prop to render a styled component.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem-as
   */
  as?: ResolvedMenuItemComponent<T>;
  /**
   * You can put any type of content inside of a `<MenuItem>`.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem-children
   */
  children: React.ReactNode;
  /**
   * Callback that fires when a `MenuItem` is selected.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem-onselect
   */
  onSelect: () => any;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menupopover-props
 */
export type MenuPopoverProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Must contain a `MenuItems`
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menupopover-children
   */
  children: React.ReactNode;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitems-props
 */
export type MenuItemsProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Can contain only `MenuItem` or a `MenuLink`.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitems-children
   */
  children: React.ReactNode;
};

/**
 * Handles linking to a different page in the menu. By default it renders `<a>`,
 * but also accepts any other kind of Link as long as the `Link` uses the
 * `React.forwardRef` API.
 *
 * Must be a direct child of a `<MenuList>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulink
 */
export function MenuLink<T extends SupportedMenuLinkComponent = "a">(
  props: MenuLinkProps<T>
): React.ReactElement<MenuLinkProps<T>>;

/**
 * The wrapper component for the other components. No DOM element is rendered.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menu
 */
export const Menu: React.FunctionComponent<MenuProps>;

/**
 * Wraps a DOM `button` that toggles the opening and closing of the dropdown
 * menu. Must be rendered inside of a `<Menu>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menubutton
 */
export const MenuButton: React.FunctionComponent<MenuButtonProps>;

/**
 * Wraps a DOM element that renders the menu items. Must be rendered inside of
 * a `<Menu>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulist
 */
export const MenuList: React.FunctionComponent<MenuListProps>;

/**
 * Handles menu selection. Must be a direct child of a `<MenuList>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem
 */
export function MenuItem<T extends SupportedMenuItemComponent = "div">(
  props: MenuItemProps<T>
): React.ReactElement<MenuItemProps<T>>;

/**
 * A low-level wrapper for the popover that appears when a menu button is open.
 * You can compose it with `MenuItems` for more control over the nested
 * components and their rendered DOM nodes, or if you need to nest arbitrary
 * components between the outer wrapper and your list.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menupopover
 */
export const MenuPopover: React.FunctionComponent<MenuPopoverProps>;

/**
 * A low-level wrapper for menu items. Compose it with `MenuPopover` for more
 * control over the nested components and their rendered DOM nodes, or if you
 * need to nest arbitrary components between the outer wrapper and your list.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitems
 */
export const MenuItems: React.FunctionComponent<MenuItemsProps>;
