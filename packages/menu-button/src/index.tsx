/**
 * Welcome to @reach/menu-button!
 *
 * An accessible dropdown menu for the common dropdown menu button design
 * pattern.
 *
 * @see Docs     https://reach.tech/menu-button
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/menu-button
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
 *
 * TODO: Fix flash when opening a menu button on a screen with another open menu
 */

import * as React from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";
import { Popover } from "@reach/popover";
import {
  DropdownProvider,
  useDropdownItem,
  useDropdownItems,
  useDropdownPopover,
  useDropdownTrigger,
  useDropdownContext,
} from "@reach/dropdown";
import { noop } from "@reach/utils/noop";
import { useCheckStyles } from "@reach/utils/dev-utils";
import { isFragment } from "react-is";

import type { Position } from "@reach/popover";
import type * as Polymorphic from "@reach/utils/polymorphic";

////////////////////////////////////////////////////////////////////////////////

/**
 * Menu
 *
 * The wrapper component for the other components. No DOM element is rendered.
 *
 * @see Docs https://reach.tech/menu-button#menu
 */
const Menu = React.forwardRef(
  ({ as: Comp = React.Fragment, id, children, ...rest }, forwardedRef) => {
    useCheckStyles("menu-button");
    let parentIsFragment = React.useMemo(() => {
      try {
        // To test if the component renders a fragment we need to actually
        // render it, but this may throw an error since we can't predict what is
        // actually provided. There's technically a small chance that this could
        // get it wrong but I don't think it's too likely in practice.
        return isFragment(<Comp />);
      } catch (err) {
        return false;
      }
    }, [Comp]);
    let props = parentIsFragment
      ? {}
      : {
          ref: forwardedRef,
          id,
          "data-reach-menu": "",
          ...rest,
        };
    return (
      <Comp {...props}>
        <DropdownProvider id={id} children={children} />
      </Comp>
    );
  }
) as Polymorphic.ForwardRefComponent<any, MenuProps>;

/**
 * @see Docs https://reach.tech/menu-button#menu-props
 */
interface MenuProps {
  /**
   * Requires two children: a `<MenuButton>` and a `<MenuList>`.
   *
   * @see Docs https://reach.tech/menu-button#menu-children
   */
  children:
    | React.ReactNode
    | ((
        props: MenuContextValue & {
          // TODO: Remove in 1.0
          isOpen: boolean;
        }
      ) => React.ReactNode);
  id?: string;
}

if (__DEV__) {
  Menu.displayName = "Menu";
  Menu.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuButton
 *
 * Wraps a DOM `button` that toggles the opening and closing of the dropdown
 * menu. Must be rendered inside of a `<Menu>`.
 *
 * @see Docs https://reach.tech/menu-button#menubutton
 */
const MenuButton = React.forwardRef(
  ({ as: Comp = "button", ...rest }, forwardedRef) => {
    let {
      data: { isExpanded, controls },
      props,
    } = useDropdownTrigger({ ...rest, ref: forwardedRef });

    return (
      <Comp
        // When the menu is displayed, the element with role `button` has
        // `aria-expanded` set to `true`. When the menu is hidden, it is
        // recommended that `aria-expanded` is not present.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
        aria-expanded={isExpanded ? true : undefined}
        // The element with role `button` has `aria-haspopup` set to either
        // `"menu"` or `true`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
        aria-haspopup
        // Optionally, the element with role `button` has a value specified for
        // `aria-controls` that refers to the element with role `menu`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
        aria-controls={controls}
        {...props}
        data-reach-menu-button=""
      />
    );
  }
) as Polymorphic.ForwardRefComponent<"button", MenuButtonProps>;

/**
 * @see Docs https://reach.tech/menu-button#menubutton-props
 */
interface MenuButtonProps {
  /**
   * Accepts any renderable content.
   *
   * @see Docs https://reach.tech/menu-button#menubutton-children
   */
  children: React.ReactNode;
}

if (__DEV__) {
  MenuButton.displayName = "MenuButton";
  MenuButton.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuItemImpl
 *
 * MenuItem and MenuLink share most of the same functionality captured here.
 */
const MenuItemImpl = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let {
      data: { disabled },
      props,
    } = useDropdownItem({ ...rest, ref: forwardedRef });

    return (
      <Comp
        role="menuitem"
        {...props}
        aria-disabled={disabled || undefined}
        data-reach-menu-item=""
      />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", MenuItemImplProps>;

interface MenuItemImplProps {
  /**
   * You can put any type of content inside of a `<MenuItem>`.
   *
   * @see Docs https://reach.tech/menu-button#menuitem-children
   */
  children: React.ReactNode;
  /**
   * Callback that fires when a `MenuItem` is selected.
   *
   * @see Docs https://reach.tech/menu-button#menuitem-onselect
   */
  onSelect(): void;
  index?: number;
  isLink?: boolean;
  valueText?: string;
  /**
   * Whether or not the item is disabled from selection and navigation.
   *
   * @see Docs https://reach.tech/menu-button#menuitem-disabled
   */
  disabled?: boolean;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuItem
 *
 * Handles menu selection. Must be a direct child of a `<MenuList>`.
 *
 * @see Docs https://reach.tech/menu-button#menuitem
 */
const MenuItem = React.forwardRef(({ as = "div", ...props }, forwardedRef) => {
  return <MenuItemImpl {...props} ref={forwardedRef} as={as} />;
}) as Polymorphic.ForwardRefComponent<"div", MenuItemProps>;

/**
 * @see Docs https://reach.tech/menu-button#menuitem-props
 */
type MenuItemProps = Omit<MenuItemImplProps, "isLink">;

if (__DEV__) {
  MenuItem.displayName = "MenuItem";
  MenuItem.propTypes = {
    as: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuItems
 *
 * A low-level wrapper for menu items. Compose it with `MenuPopover` for more
 * control over the nested components and their rendered DOM nodes, or if you
 * need to nest arbitrary components between the outer wrapper and your list.
 *
 * @see Docs https://reach.tech/menu-button#menuitems
 */
const MenuItems = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let {
      data: { activeDescendant, triggerId },
      props,
    } = useDropdownItems({ ...rest, ref: forwardedRef });

    return (
      // TODO: Should probably file a but in jsx-a11y, but this is correct
      // according to https://www.w3.org/TR/wai-aria-practices-1.2/examples/menu-button/menu-button-actions-active-descendant.html
      // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
      <Comp
        // Refers to the descendant menuitem element that is visually indicated
        // as focused.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/menu-button/menu-button-actions-active-descendant.html
        aria-activedescendant={activeDescendant}
        // Refers to the element that contains the accessible name for the
        // `menu`. The menu is labeled by the menu button.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/menu-button/menu-button-actions-active-descendant.html
        aria-labelledby={triggerId || undefined}
        // The element that contains the menu items displayed by activating the
        // button has role menu.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
        role="menu"
        {...props}
        data-reach-menu-items=""
      />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", MenuItemsProps>;

/**
 * @see Docs https://reach.tech/menu-button#menuitems-props
 */
interface MenuItemsProps {
  /**
   * Can contain only `MenuItem` or a `MenuLink`.
   *
   * @see Docs https://reach.tech/menu-button#menuitems-children
   */
  children: React.ReactNode;
}

if (__DEV__) {
  MenuItems.displayName = "MenuItems";
  MenuItems.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuLink
 *
 * Handles linking to a different page in the menu. By default it renders `<a>`,
 * but also accepts any other kind of Link as long as the `Link` uses the
 * `React.forwardRef` API.
 *
 * Must be a direct child of a `<MenuList>`.
 *
 * @see Docs https://reach.tech/menu-button#menulink
 */
const MenuLink = React.forwardRef(
  (
    {
      as = "a",
      // @ts-ignore
      component,
      onSelect,
      ...props
    },
    forwardedRef
  ) => {
    useDevWarning(
      !component,
      "[@reach/menu-button]: Please use the `as` prop instead of `component`"
    );

    return (
      <MenuItemImpl
        {...props}
        ref={forwardedRef}
        data-reach-menu-link=""
        as={as}
        isLink={true}
        onSelect={onSelect || noop}
      />
    );
  }
) as Polymorphic.ForwardRefComponent<"a", MenuLinkProps>;

/**
 * @see Docs https://reach.tech/menu-button#menulink-props
 */
type MenuLinkProps = Omit<MenuItemImplProps, "isLink" | "onSelect"> & {
  onSelect?(): void;
};

if (__DEV__) {
  MenuLink.displayName = "MenuLink";
  MenuLink.propTypes = {
    as: PropTypes.any,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuList
 *
 * Wraps a DOM element that renders the menu items. Must be rendered inside of
 * a `<Menu>`.
 *
 * @see Docs https://reach.tech/menu-button#menulist
 */
const MenuList = React.forwardRef(
  ({ portal = true, ...props }, forwardedRef) => {
    return (
      <MenuPopover portal={portal}>
        <MenuItems {...props} ref={forwardedRef} data-reach-menu-list="" />
      </MenuPopover>
    );
  }
) as Polymorphic.ForwardRefComponent<"div", MenuListProps>;

/**
 * @see Docs https://reach.tech/menu-button#menulist-props
 */
interface MenuListProps {
  /**
   * Whether or not the popover should be rendered inside a portal. Defaults to
   * `true`.
   *
   * @see Docs https://reach.tech/menu-button#menulist-portal
   */
  portal?: boolean;
  /**
   * Can contain only `MenuItem` or a `MenuLink`.
   *
   * @see Docs https://reach.tech/menu-button#menulist-children
   */
  children: React.ReactNode;
}

if (__DEV__) {
  MenuList.displayName = "MenuList";
  MenuList.propTypes = {
    children: PropTypes.node.isRequired,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuPopover
 *
 * A low-level wrapper for the popover that appears when a menu button is open.
 * You can compose it with `MenuItems` for more control over the nested
 * components and their rendered DOM nodes, or if you need to nest arbitrary
 * components between the outer wrapper and your list.
 *
 * @see Docs https://reach.tech/menu-button#menupopover
 */
const MenuPopover = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let {
      data: { portal, targetRef, position },
      props,
    } = useDropdownPopover({ ...rest, ref: forwardedRef });

    let sharedProps = {
      "data-reach-menu-popover": "",
    };

    return portal ? (
      <Popover
        {...props}
        {...sharedProps}
        as={Comp}
        targetRef={targetRef as any}
        position={position}
      />
    ) : (
      <Comp {...props} {...sharedProps} />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", MenuPopoverProps>;

/**
 * @see Docs https://reach.tech/menu-button#menupopover-props
 */
interface MenuPopoverProps {
  /**
   * Must contain a `MenuItems`
   *
   * @see Docs https://reach.tech/menu-button#menupopover-children
   */
  children: React.ReactNode;
  /**
   * Whether or not the popover should be rendered inside a portal. Defaults to
   * `true`.
   *
   * @see Docs https://reach.tech/menu-button#menupopover-portal
   */
  portal?: boolean;
  /**
   * A function used to determine the position of the popover in relation to the
   * menu button. By default, the menu button will attempt to position the
   * popover below the button aligned with its left edge. If this positioning
   * results in collisions with any side of the window, the popover will be
   * anchored to a different side to avoid those collisions if possible.
   *
   * @see Docs https://reach.tech/menu-button#menupopover-position
   */
  position?: Position;
}

if (__DEV__) {
  MenuPopover.displayName = "MenuPopover";
  MenuPopover.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Menu` component to its descendants.
 *
 * @see Docs https://reach.tech/menu-button#usemenubuttoncontext
 */
function useMenuButtonContext(): MenuContextValue {
  let {
    state: { isExpanded },
  } = useDropdownContext();
  return React.useMemo(() => ({ isExpanded }), [isExpanded]);
}

////////////////////////////////////////////////////////////////////////////////

function useDevWarning(condition: any, message: string) {
  if (__DEV__) {
    /* eslint-disable react-hooks/rules-of-hooks */
    let messageRef = React.useRef(message);
    React.useEffect(() => {
      messageRef.current = message;
    }, [message]);
    React.useEffect(() => {
      warning(condition, messageRef.current);
    }, [condition]);
    /* eslint-enable react-hooks/rules-of-hooks */
  }
}

////////////////////////////////////////////////////////////////////////////////
// Types

interface MenuContextValue {
  isExpanded: boolean;
  // id: string | undefined;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  MenuButtonProps,
  MenuContextValue,
  MenuItemProps,
  MenuItemsProps,
  MenuLinkProps,
  MenuListProps,
  MenuPopoverProps,
  MenuProps,
};
export {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuLink,
  MenuList,
  MenuPopover,
  useMenuButtonContext,
};
