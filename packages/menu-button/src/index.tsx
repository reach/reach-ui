/**
 * Welcome to @reach/menu-button!
 *
 * An accessible dropdown menu for the common dropdown menu button design
 * pattern.
 *
 * @see Docs     https://reacttraining.com/reach-ui/menu-button
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/menu-button
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton
 *
 * TODO: Fix flash when opening a menu button on a screen with another open menu
 */

import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState
} from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import Popover, { Position } from "@reach/popover";
import {
  checkStyles,
  createDescendantContext,
  createNamedContext,
  Descendant,
  DescendantProvider,
  forwardRefWithAs,
  makeId,
  noop,
  useDescendant,
  useDescendants,
  useForkedRef,
  usePrevious,
  wrapEvent
} from "@reach/utils";

////////////////////////////////////////////////////////////////////////////////
// Actions

const CLEAR_SELECTION_INDEX = "CLEAR_SELECTION_INDEX";
const CLICK_MENU_ITEM = "CLICK_MENU_ITEM";
const CLOSE_MENU = "CLOSE_MENU";
const OPEN_MENU_AT_FIRST_ITEM = "OPEN_MENU_AT_FIRST_ITEM";
const SEARCH_FOR_ITEM = "SEARCH_FOR_ITEM";
const SELECT_ITEM_AT_INDEX = "SELECT_ITEM_AT_INDEX";
const SET_BUTTON_ID = "SET_BUTTON_ID";

const MenuDescendantContext = createDescendantContext<
  HTMLElement,
  DescendantProps
>("MenuDescendantContext");
const MenuContext = createNamedContext<IMenuContext>(
  "MenuContext",
  {} as IMenuContext
);
const useMenuContext = () => useContext(MenuContext);

const initialState: MenuButtonState = {
  /*
   * The button ID is needed for aria controls and can be set directly and
   * updated for top-level use via context. Otherwise a default is set by useId.
   * TODO: Consider deprecating direct ID in 1.0 in favor of id at the top level
   *       for passing deterministic IDs to descendent components.
   */
  buttonId: null,

  /*
   * Whether or not the menu is expanded
   */
  isOpen: false,

  /*
   * When a user begins typing a character string, the selection will change if
   * a matching item is found
   */
  typeaheadQuery: "",

  /*
   * The index of the current selected item. When the selection is cleared a
   * value of -1 is used.
   */
  selectionIndex: -1
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Menu
 *
 * The wrapper component for the other components. No DOM element is rendered.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menu
 */
export const Menu: React.FC<MenuProps> = ({ id, children }) => {
  let buttonRef = useRef(null);
  let menuRef = useRef(null);
  let popoverRef = useRef(null);
  let [descendants, setDescendants] = useDescendants<
    HTMLElement,
    DescendantProps
  >();
  let [state, dispatch] = useReducer(reducer, initialState);
  let menuId = useId(id);

  let context: IMenuContext = {
    buttonRef,
    dispatch,
    menuId,
    menuRef,
    popoverRef,
    state
  };

  useEffect(() => checkStyles("menu-button"), []);

  return (
    <DescendantProvider
      context={MenuDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <MenuContext.Provider value={context}>
        {typeof children === "function"
          ? children({ isOpen: state.isOpen })
          : children}
      </MenuContext.Provider>
    </DescendantProvider>
  );
};

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
  id?: string;
}

Menu.displayName = "Menu";
if (__DEV__) {
  Menu.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuButton
 *
 * Wraps a DOM `button` that toggles the opening and closing of the dropdown
 * menu. Must be rendered inside of a `<Menu>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menubutton
 */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton({ onKeyDown, onMouseDown, id, ...props }, forwardedRef) {
    let {
      buttonRef,
      menuId,
      state: { buttonId, isOpen },
      dispatch
    } = useMenuContext();
    let ref = useForkedRef(buttonRef, forwardedRef);

    useEffect(() => {
      let newButtonId =
        id != null
          ? id
          : menuId
          ? makeId("menu-button", menuId)
          : "menu-button";
      if (buttonId !== newButtonId) {
        dispatch({
          type: SET_BUTTON_ID,
          payload: newButtonId
        });
      }
    }, [buttonId, dispatch, id, menuId]);

    function handleKeyDown(event: React.KeyboardEvent) {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp":
          event.preventDefault(); // prevent scroll
          dispatch({ type: OPEN_MENU_AT_FIRST_ITEM });
          break;
        case "Enter":
        case " ":
          dispatch({ type: OPEN_MENU_AT_FIRST_ITEM });
          break;
        default:
          break;
      }
    }

    function handleMouseDown() {
      if (isOpen) {
        dispatch({ type: CLOSE_MENU, payload: { buttonRef } });
      } else {
        dispatch({ type: OPEN_MENU_AT_FIRST_ITEM });
      }
    }

    return (
      <button
        {...props}
        ref={ref}
        data-reach-menu-button=""
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id={buttonId || undefined}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        type="button"
      />
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menubutton-props
 */
export type MenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Accepts any renderable content.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menubutton-children
   */
  children: React.ReactNode;
};

MenuButton.displayName = "MenuButton";
if (__DEV__) {
  MenuButton.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuItemImpl
 *
 * MenuItem and MenuLink share most of the same functionality captured here.
 */
const MenuItemImpl = forwardRefWithAs<MenuItemImplProps, "div">(
  function MenuItemImpl(
    {
      as: Comp,
      index: indexProp,
      isLink = false,
      onClick,
      onDragStart,
      onKeyDown,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      onSelect,
      valueText: valueTextProp,
      ...props
    },
    forwardedRef
  ) {
    let {
      buttonRef,
      dispatch,
      menuRef,
      state: { isOpen, selectionIndex }
    } = useMenuContext();

    let ownRef = useRef<HTMLElement | null>(null);

    /*
     * After the ref is mounted to the DOM node, we check to see if we have an
     * explicit valueText prop before looking for the node's textContent for
     * typeahead functionality.
     */
    let [valueText, setValueText] = useState(valueTextProp || "");
    let setValueTextFromDom = useCallback(
      node => {
        if (node) {
          ownRef.current = node;
          if (
            !valueTextProp ||
            (node.textContent && valueText !== node.textContent)
          ) {
            setValueText(node.textContent);
          }
        }
      },
      [valueText, valueTextProp]
    );

    let ref = useForkedRef(forwardedRef, setValueTextFromDom);

    let mouseEventStarted = useRef(false);

    const index = useDescendant(
      {
        context: MenuDescendantContext,
        element: ownRef.current,
        key: valueText
      },
      indexProp
    );
    let isSelected = index === selectionIndex;

    function select() {
      dispatch({
        type: CLICK_MENU_ITEM,
        payload: { buttonRef, callback: onSelect }
      });
    }

    function handleClick(event: React.MouseEvent) {
      if (isLink && !isRightClick(event.nativeEvent)) {
        select();
      }
    }

    function handleDragStart(event: React.MouseEvent) {
      /*
       * Because we don't preventDefault on mousedown for links (we need the
       * native click event), clicking and holding on a link triggers a dragstart
       * which we don't want.
       */
      if (isLink) {
        event.preventDefault();
      }
    }

    function handleKeyDown(event: React.KeyboardEvent) {
      if (event.key === "Enter" || event.key === " ") {
        /*
         * For links, the Enter key will trigger a click by default, but for
         * consistent behavior across menu items we'll trigger a click when the
         * spacebar is pressed.
         */
        if (isLink) {
          if (event.key === " " && ownRef.current) {
            ownRef.current.click();
          }
        } else {
          event.preventDefault();
          select();
        }
      }
    }

    function handleMouseDown(event: React.MouseEvent) {
      if (isRightClick(event.nativeEvent)) return;

      if (isLink) {
        /*
         * Signal that the mouse is down so we can react call the right function
         * if the user is clicking on a link.
         */
        mouseEventStarted.current = true;
      } else {
        event.preventDefault();
      }
    }

    function handleMouseEnter(event: React.MouseEvent) {
      if (!isSelected && index != null) {
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index } });
      }
    }

    function handleMouseLeave(event: React.MouseEvent) {
      // Clear out selection when mouse over a non-menu item child.
      dispatch({ type: CLEAR_SELECTION_INDEX });
    }

    function handleMouseMove(event: React.MouseEvent) {
      if (!isSelected && index != null) {
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index } });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (isRightClick(event.nativeEvent)) return;

      if (isLink) {
        /*
         * If a mousedown event was initiated on a menu link followed be a mouseup
         * event on the same link, we do nothing; a click event will come next and
         * handle selection. Otherwise, we trigger a click event imperatively.
         */
        if (mouseEventStarted.current) {
          mouseEventStarted.current = false;
        } else if (ownRef.current) {
          ownRef.current.click();
        }
      } else {
        select();
      }
    }

    /*
     * Any time a mouseup event occurs anywhere in the document, we reset the
     * mouseEventStarted ref so we can check it again when needed.
     */
    useEffect(() => {
      let listener = () => (mouseEventStarted.current = false);
      document.addEventListener("mouseup", listener);
      return () => document.removeEventListener("mouseup", listener);
    }, []);

    /**
     * When a new selection is made the item should receive focus. When no item is
     * selected, focus is placed on the menu itself so that keyboard navigation is
     * still possible.
     */
    useEffect(() => {
      if (isOpen) {
        // @ts-ignore
        window.__REACH_DISABLE_TOOLTIPS = true;
        window.requestAnimationFrame(() => {
          if (selectionIndex !== -1) {
            /*
             * We haven't measured the popover yet, so give it a frame otherwise
             * we'll scroll to the bottom of the page >.<
             */
            if (ownRef.current && index === selectionIndex) {
              ownRef.current.focus();
            }
          } else {
            /*
             * Clear highlight when mousing over non-menu items, but focus the
             * menu so the the keyboard will work after a mouseover.
             */
            menuRef.current && menuRef.current.focus();
          }
        });
      } else {
        /*
         * We want to ignore the immediate focus of a tooltip so it doesn't pop
         * up again when the menu closes, only pops up when focus returns again
         * to the tooltip (like native OS tooltips).
         */
        // @ts-ignore
        window.__REACH_DISABLE_TOOLTIPS = false;
      }
    }, [index, isOpen, menuRef, selectionIndex]);

    return (
      <Comp
        {...props}
        ref={ref}
        data-reach-menu-item=""
        data-selected={isSelected ? "" : undefined}
        data-valuetext={valueText}
        onClick={wrapEvent(onClick, handleClick)}
        onDragStart={wrapEvent(onDragStart, handleDragStart)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseEnter={wrapEvent(onMouseEnter, handleMouseEnter)}
        onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
        onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        role="menuitem"
        tabIndex={-1}
      />
    );
  }
);

export type MenuItemImplProps = {
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
  index?: number;
  isLink?: boolean;
  valueText?: string;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuItem
 *
 * Handles menu selection. Must be a direct child of a `<MenuList>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem
 */
export const MenuItem = forwardRefWithAs<MenuItemProps, "div">(
  function MenuItem({ as = "div", ...props }, forwardedRef) {
    return <MenuItemImpl {...props} ref={forwardedRef} as={as} />;
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitem-props
 */
export type MenuItemProps = Omit<MenuItemImplProps, "isLink">;

MenuItem.displayName = "MenuItem";
if (__DEV__) {
  MenuItem.propTypes = {
    as: PropTypes.any,
    onSelect: PropTypes.func.isRequired
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
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitems
 */
export const MenuItems = forwardRef<HTMLDivElement, MenuItemsProps>(
  function MenuItems({ children, onKeyDown, onBlur, ...props }, forwardedRef) {
    const {
      dispatch,
      buttonRef,
      menuRef,
      state: { isOpen, buttonId, selectionIndex, typeaheadQuery }
    } = useMenuContext();
    const { descendants: menuItems } = useContext(MenuDescendantContext);
    const ref = useForkedRef(menuRef, forwardedRef);

    useEffect(() => {
      // Respond to user char key input with typeahead
      const match = findItemFromTypeahead(menuItems, typeaheadQuery);
      if (typeaheadQuery && match != null) {
        dispatch({
          type: SELECT_ITEM_AT_INDEX,
          payload: { index: match }
        });
      }
      let timeout = window.setTimeout(
        () =>
          typeaheadQuery && dispatch({ type: SEARCH_FOR_ITEM, payload: "" }),
        1000
      );
      return () => window.clearTimeout(timeout);
    }, [dispatch, menuItems, typeaheadQuery]);

    const prevMenuItemsLength = usePrevious(menuItems.length);
    const prevSelected = usePrevious(menuItems[selectionIndex]);
    const prevSelectionIndex = usePrevious(selectionIndex);

    useEffect(() => {
      if (selectionIndex > menuItems.length - 1) {
        /*
         * If for some reason our selection index is larger than our possible
         * index range (let's say the last item is selected and the list
         * dynamically updates), we need to select the last item in the list.
         */
        dispatch({
          type: SELECT_ITEM_AT_INDEX,
          payload: { index: menuItems.length - 1 }
        });
      } else if (
        /*
         * Checks if
         *  - menu length has changed
         *  - selection index has not changed BUT selected item has changed
         *
         * This prevents any dynamic adding/removing of menu items from actually
         * changing a user's expected selection.
         */
        prevMenuItemsLength !== menuItems.length &&
        selectionIndex > -1 &&
        prevSelected &&
        prevSelectionIndex === selectionIndex &&
        menuItems[selectionIndex] !== prevSelected
      ) {
        dispatch({
          type: SELECT_ITEM_AT_INDEX,
          payload: {
            index: menuItems.findIndex(i => i.key === prevSelected.key)
          }
        });
      }
    }, [
      dispatch,
      menuItems,
      prevMenuItemsLength,
      prevSelected,
      prevSelectionIndex,
      selectionIndex
    ]);

    function handleKeyDown(event: React.KeyboardEvent) {
      const { key } = event;

      if (!isOpen) {
        return;
      }

      switch (key) {
        case "Escape":
          dispatch({ type: CLOSE_MENU, payload: { buttonRef } });
          break;
        case "Home":
          // prevent window scroll
          event.preventDefault();
          dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index: 0 } });
          break;
        case "End":
          // prevent window scroll
          event.preventDefault();
          dispatch({
            type: SELECT_ITEM_AT_INDEX,
            payload: { index: menuItems.length - 1 }
          });
          break;
        case "ArrowDown":
          // prevent window scroll
          event.preventDefault();
          const nextIndex = Math.min(selectionIndex + 1, menuItems.length - 1);
          dispatch({
            type: SELECT_ITEM_AT_INDEX,
            payload: { index: nextIndex }
          });
          break;
        case "ArrowUp":
          // prevent window scroll
          event.preventDefault();
          const prevIndex = Math.max(selectionIndex - 1, 0);
          dispatch({
            type: SELECT_ITEM_AT_INDEX,
            payload: { index: prevIndex }
          });
          break;
        case "Tab":
          // prevent leaving
          event.preventDefault();
          break;
        default:
          /*
           * Check if a user is typing some char keys and respond by setting the
           * query state.
           */
          if (typeof key === "string" && key.length === 1) {
            const query = typeaheadQuery + key.toLowerCase();
            dispatch({
              type: SEARCH_FOR_ITEM,
              payload: query
            });
          }
          break;
      }
    }

    return (
      <div
        {...props}
        ref={ref}
        data-reach-menu-items=""
        aria-labelledby={buttonId || undefined}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        role="menu"
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitems-props
 */
export type MenuItemsProps = {
  /**
   * Can contain only `MenuItem` or a `MenuLink`.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menuitems-children
   */
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

MenuItems.displayName = "MenuItems";
if (__DEV__) {
  MenuItems.propTypes = {
    children: PropTypes.node
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
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulink
 */
export const MenuLink = forwardRefWithAs<
  MenuLinkProps & { component?: any },
  "a"
>(function MenuLink({ as = "a", component, onSelect, ...props }, forwardedRef) {
  if (component) {
    console.warn(
      "[@reach/menu-button]: Please use the `as` prop instead of `component`."
    );
  }

  return (
    <div role="none" tabIndex={-1}>
      <MenuItemImpl
        {...props}
        ref={forwardedRef}
        data-reach-menu-link=""
        as={as}
        isLink={true}
        onSelect={onSelect || noop}
      />
    </div>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulink-props
 */
export type MenuLinkProps = Omit<MenuItemImplProps, "isLink" | "onSelect"> & {
  to?: string;
  onSelect?: () => any;
};

MenuLink.displayName = "MenuLink";
if (__DEV__) {
  MenuLink.propTypes = {
    as: PropTypes.any,
    component: PropTypes.any
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MenuList
 *
 * Wraps a DOM element that renders the menu items. Must be rendered inside of
 * a `<Menu>`.
 *
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulist
 */
export const MenuList = forwardRef<HTMLDivElement, MenuListProps>(
  function MenuList(props, forwardedRef) {
    return (
      <MenuPopover>
        <MenuItems {...props} ref={forwardedRef} data-reach-menu-list="" />
      </MenuPopover>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menulist-props
 */
export type MenuListProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Can contain only `MenuItem` or a `MenuLink`.
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menulist-children
   */
  children: React.ReactNode;
};

MenuList.displayName = "MenuList";
if (__DEV__) {
  MenuList.propTypes = {
    children: PropTypes.node.isRequired
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
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menupopover
 */
export const MenuPopover = forwardRef<any, MenuPopoverProps>(
  function MenuPopover({ children, onBlur, style, ...props }, forwardedRef) {
    const {
      buttonRef,
      dispatch,
      menuRef,
      popoverRef,
      state: { isOpen }
    } = useMenuContext();

    const ref = useForkedRef(popoverRef, forwardedRef);

    function handleBlur(event: React.FocusEvent) {
      const { relatedTarget } = event;
      requestAnimationFrame(() => {
        // We on want to close only if focus rests outside the menu
        if (
          document.activeElement !== menuRef.current &&
          document.activeElement !== buttonRef.current &&
          popoverRef.current
        ) {
          if (
            !popoverRef.current.contains(
              (relatedTarget as Element) || document.activeElement
            )
          ) {
            dispatch({ type: CLOSE_MENU, payload: { buttonRef } });
          }
        }
      });
    }
    return isOpen ? (
      <Popover
        {...props}
        ref={ref}
        data-reach-menu="" // deprecate for naming consistency?
        data-reach-menu-popover=""
        onBlur={wrapEvent(onBlur, handleBlur)}
        // TODO: Fix in @reach/popover
        // @ts-ignore
        targetRef={buttonRef}
      >
        {children}
      </Popover>
    ) : null;
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/menu-button#menupopover-props
 */
export type MenuPopoverProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Must contain a `MenuItems`
   *
   * @see Docs https://reacttraining.com/reach-ui/menu-button#menupopover-children
   */
  children: React.ReactNode;
  position?: Position;
};

MenuPopover.displayName = "MenuPopover";
if (__DEV__) {
  MenuPopover.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * When a user's typed input matches the string displayed in a menu item, it is
 * expected that the matching menu item is selected. This is our matching
 * function.
 */
function findItemFromTypeahead(
  items: Descendant<HTMLElement>[],
  string: string = ""
) {
  if (!string) {
    return null;
  }

  const found = items.find(({ element }) =>
    element?.dataset?.valuetext?.toLowerCase().startsWith(string)
  );
  return found ? items.indexOf(found) : null;
}

interface MenuButtonState {
  isOpen: boolean;
  selectionIndex: number;
  buttonId: null | string;
  typeaheadQuery: string;
}

type MenuButtonAction =
  | {
      type: "CLICK_MENU_ITEM";
      payload: { buttonRef: ButtonRef; callback?: () => any };
    }
  | { type: "CLOSE_MENU"; payload: { buttonRef: ButtonRef } }
  | { type: "OPEN_MENU_AT_FIRST_ITEM" }
  | {
      type: "SELECT_ITEM_AT_INDEX";
      payload: { max?: number; min?: number; index: number };
    }
  | { type: "CLEAR_SELECTION_INDEX" }
  | { type: "SET_BUTTON_ID"; payload: string }
  | { type: "SEARCH_FOR_ITEM"; payload: string };

function isRightClick(nativeEvent: MouseEvent) {
  if ("which" in nativeEvent) {
    return nativeEvent.which === 3;
  } else if ("button" in nativeEvent) {
    return (nativeEvent as any).button === 2;
  }
  return false;
}

function reducer(
  state: MenuButtonState,
  action: MenuButtonAction = {} as MenuButtonAction
): MenuButtonState {
  switch (action.type) {
    case CLICK_MENU_ITEM:
      /*
       * Focus the button first by default when an item is selected. We fire the
       * onSelect callback next so the app can manage focus if needed.
       */
      if (action.payload.buttonRef.current) {
        action.payload.buttonRef.current.focus();
      }
      action.payload.callback && action.payload.callback();
      return {
        ...state,
        isOpen: false,
        selectionIndex: -1
      };
    case CLOSE_MENU:
      action.payload.buttonRef.current?.focus();
      return {
        ...state,
        isOpen: false,
        selectionIndex: -1
      };
    case OPEN_MENU_AT_FIRST_ITEM:
      return {
        ...state,
        isOpen: true,
        selectionIndex: 0
      };
    case SELECT_ITEM_AT_INDEX:
      if (action.payload.index >= 0) {
        return {
          ...state,
          selectionIndex:
            action.payload.max != null
              ? Math.min(Math.max(action.payload.index, 0), action.payload.max)
              : Math.max(action.payload.index, 0)
        };
      }
      return state;
    case CLEAR_SELECTION_INDEX:
      return {
        ...state,
        selectionIndex: -1
      };
    case SET_BUTTON_ID:
      return {
        ...state,
        buttonId: action.payload
      };
    case SEARCH_FOR_ITEM:
      if (typeof action.payload !== "undefined") {
        return {
          ...state,
          typeaheadQuery: action.payload
        };
      }
      return state;
    default:
      return state;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Types

type DescendantProps = { key: string };
type ButtonRef = React.RefObject<null | HTMLElement>;
type MenuRef = React.RefObject<null | HTMLElement>;
type PopoverRef = React.RefObject<null | HTMLElement>;

interface IMenuContext {
  buttonRef: ButtonRef;
  dispatch: React.Dispatch<MenuButtonAction>;
  menuId: string | undefined;
  menuRef: MenuRef;
  popoverRef: PopoverRef;
  state: MenuButtonState;
}
