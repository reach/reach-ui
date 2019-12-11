import React, {
  Children,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState
} from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import Popover from "@reach/popover";
import {
  checkStyles,
  makeId,
  noop,
  useForkedRef,
  wrapEvent
} from "@reach/utils";

////////////////////////////////////////////////////////////////////////////////
// Actions

const CLOSE_MENU = "CLOSE_MENU";
const OPEN_MENU_AT_FIRST_ITEM = "OPEN_MENU_AT_FIRST_ITEM";
const SET_BUTTON_ID = "SET_BUTTON_ID";
const SELECT_ITEM_AT_INDEX = "SELECT_ITEM_AT_INDEX";
const CLICK_MENU_ITEM = "CLICK_MENU_ITEM";
const CLEAR_SELECTION_INDEX = "CLEAR_SELECTION_INDEX";
const SEARCH_FOR_ITEM = "SEARCH_FOR_ITEM";

const MenuContext = createContext();
const useMenuContext = () => useContext(MenuContext);

const initialState = {
  /*
   * The button ID is needed for aria controls and can be set directly and
   * updated for top-level use via context. Otherwise a default is set by useId
   *
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
  searchQuery: "",

  /*
   * The index of the current selected item. When the selection is cleared a
   * value of -1 is used.
   */
  selectionIndex: -1
};

////////////////////////////////////////////////////////////////////////////////
// Menu

export const Menu = ({ id, children }) => {
  const buttonRef = useRef(null);

  const menuRef = useRef(null);

  const itemsRef = useRef([]);

  const popoverRef = useRef(null);

  /*
   * On the first render we say we're "assigning", and the menu items will be
   * pushed into the array when they show up in their own useLayoutEffect.
   */
  const assigningItems = useRef(true);

  /*
   * since children are pushed into the array in useLayoutEffect of the child,
   * children can't read their index on first render.  So we need to cause a
   * second render so they can read their index.
   */
  const [, forceUpdate] = useState();

  const [state, dispatch] = useReducer(reducer, initialState);

  const { isOpen } = state;

  const menuId = useId(id);

  useEffect(() => {
    checkStyles("menu-button");
  }, []);

  const context = {
    assigningItems,
    buttonRef,
    dispatch,
    forceUpdate,
    itemsRef,
    menuId,
    menuRef,
    popoverRef,
    state
  };

  return (
    <MenuContext.Provider value={context}>
      {typeof children === "function" ? children({ isOpen }) : children}
    </MenuContext.Provider>
  );
};

Menu.displayName = "Menu";
if (__DEV__) {
  Menu.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuButton

export const MenuButton = forwardRef(function MenuButton(
  { onKeyDown, onMouseDown, id, ...props },
  forwardedRef
) {
  const {
    buttonRef,
    menuId,
    state: { buttonId, isOpen },
    dispatch
  } = useMenuContext();
  const ref = useForkedRef(buttonRef, forwardedRef);

  useEffect(
    () =>
      dispatch({
        type: SET_BUTTON_ID,
        payload: id != null ? id : makeId("menu-button", menuId)
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function handleKeyDown(event) {
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

  function handleMouseDown(event) {
    // event.preventDefault();
    if (isOpen) {
      dispatch({ type: CLOSE_MENU });
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
      id={buttonId}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
      type="button"
    />
  );
});

MenuButton.displayName = "MenuButton";
if (__DEV__) {
  MenuButton.propTypes = {
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuItem

export const MenuItem = forwardRef(function MenuItem(
  {
    as: Comp = "div",
    children,
    onKeyDown,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    onSelect,
    role = "menuitem",
    valueText: valueTextProp,
    _excludeFromItemsArray = false,
    ...props
  },
  forwardedRef
) {
  const {
    buttonRef,
    dispatch,
    state: { selectionIndex }
  } = useMenuContext();

  const ownRef = useRef(null);

  const ref = useForkedRef(ownRef, forwardedRef);

  const valueText =
    valueTextProp || recursivelyFindStringChild(children) || null;

  const index = useMenuDescendant(valueText, _excludeFromItemsArray);

  const isSelected = index !== null && index === selectionIndex;

  function handleMouseUp() {
    dispatch({
      type: CLICK_MENU_ITEM,
      payload: { buttonRef, callback: onSelect }
    });
  }

  function handleMouseLeave() {
    // clear out selection when mouse over a non-menu item child
    dispatch({ type: CLEAR_SELECTION_INDEX });
  }

  function handleMouseMove() {
    if (!isSelected && index != null) {
      dispatch({ type: SELECT_ITEM_AT_INDEX, payload: index });
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      // prevent the button from being "clicked" by
      // this "Enter" keydown
      event.preventDefault();
      dispatch({
        type: CLICK_MENU_ITEM,
        payload: { buttonRef, callback: onSelect }
      });
    }
  }

  useMenuItemFocus(ownRef, index, _excludeFromItemsArray);

  return (
    <Comp
      {...props}
      ref={ref}
      data-reach-menu-item={role === "menuitem" ? "" : undefined}
      data-selected={role === "menuitem" && isSelected ? true : undefined}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
      onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
      onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
      role={role}
      tabIndex={-1}
    >
      {children}
    </Comp>
  );
});

MenuItem.displayName = "MenuItem";
if (__DEV__) {
  MenuItem.propTypes = {
    as: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    role: PropTypes.string,
    state: PropTypes.object,
    setState: PropTypes.func,
    onKeyDown: PropTypes.func,
    onMouseMove: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuItems

export const MenuItems = forwardRef(function MenuItems(
  { children, onKeyDown, onBlur, ...props },
  forwardedRef
) {
  const {
    assigningItems,
    dispatch,
    forceUpdate,
    buttonRef,
    itemsRef,
    menuRef,
    state: { isOpen, buttonId, selectionIndex, searchQuery }
  } = useMenuContext();
  const ref = useForkedRef(menuRef, forwardedRef);

  useEffect(() => {
    const match = findItemFromSearch(itemsRef.current, searchQuery);
    if (searchQuery && match != null) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: match
      });
    }
    let timeout = window.setTimeout(
      () => searchQuery && dispatch({ type: SEARCH_FOR_ITEM, payload: "" }),
      1000
    );
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function handleKeyDown(event) {
    const { key } = event;
    const items = itemsRef.current.map(({ node }) => node);

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
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: 0 });
        break;
      case "End":
        // prevent window scroll
        event.preventDefault();
        dispatch({
          type: SELECT_ITEM_AT_INDEX,
          payload: items.length - 1
        });
        break;
      case "ArrowDown":
        // prevent window scroll
        event.preventDefault();
        const nextIndex = Math.min(selectionIndex + 1, items.length - 1);
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: nextIndex });
        break;
      case "ArrowUp":
        // prevent window scroll
        event.preventDefault();
        const prevIndex = Math.max(selectionIndex - 1, 0);
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: prevIndex });
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
          const query = searchQuery + key.toLowerCase();
          dispatch({
            type: SEARCH_FOR_ITEM,
            payload: query
          });
        }
        break;
    }
  }

  // https://github.com/reach/reach-ui/blob/dev-descendants/packages/descendants/src/index.js
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (assigningItems.current) {
      assigningItems.current = false;
      forceUpdate({});
    } else {
      assigningItems.current = true;
    }
    return () => {
      if (assigningItems.current) {
        itemsRef.current = [];
      }
    };
  });

  return (
    <div
      {...props}
      ref={ref}
      data-reach-menu-items=""
      aria-labelledby={buttonId}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      role="menu"
      tabIndex={-1}
    >
      {children}
    </div>
  );
});

MenuItems.displayName = "MenuItems";
if (__DEV__) {
  MenuItems.propTypes = {
    refs: PropTypes.object,
    state: PropTypes.object,
    setState: PropTypes.func,
    children: PropTypes.node,
    onKeyDown: PropTypes.func,
    onBlur: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuLink

export const MenuLink = forwardRef(function MenuLink(
  {
    as = "a",
    children,
    component,
    onClick,
    onKeyDown,
    onMouseMove,
    onMouseUp,
    role,
    valueText: valueTextProp,
    ...props
  },
  forwardedRef
) {
  const {
    dispatch,
    state: { selectionIndex }
  } = useMenuContext();

  const ownRef = useRef(null);

  const ref = useForkedRef(ownRef, forwardedRef);

  const valueText =
    valueTextProp || recursivelyFindStringChild(children) || null;

  const Comp = component || as;

  const index = useMenuDescendant(valueText);

  const isSelected =
    index !== null && index === selectionIndex ? true : undefined;

  if (component) {
    console.warn(
      "[@reach/menu-button]: Please use the `as` prop instead of `component`."
    );
  }

  function handleClick() {
    dispatch({ type: CLOSE_MENU });
  }

  function handleMouseUp() {
    ownRef.current && ownRef.current.click();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      // prevent MenuItem's preventDefault from firing,
      // allowing this link to work w/ the keyboard
      event.stopPropagation();
    }
  }

  function handleMouseMove() {
    if (!isSelected && index != null) {
      dispatch({ type: SELECT_ITEM_AT_INDEX, payload: index });
    }
  }

  useMenuItemFocus(ownRef, index);

  return (
    <MenuItem
      role="none"
      onSelect={noop}
      valueText={valueText}
      _excludeFromItemsArray={true}
    >
      <Comp
        {...props}
        ref={ref}
        data-reach-menu-item=""
        data-reach-menu-link=""
        data-selected={isSelected}
        as={as}
        onClick={wrapEvent(onClick, handleClick)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        role="menuitem"
        tabIndex={-1}
      >
        {children}
      </Comp>
    </MenuItem>
  );
});

MenuLink.displayName = "MenuLink";
if (__DEV__) {
  MenuLink.propTypes = {
    as: PropTypes.any,
    component: PropTypes.any,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuList

export const MenuList = forwardRef(function MenuList(props, forwardedRef) {
  return (
    <MenuPopover>
      <MenuItems {...props} ref={forwardedRef} data-reach-menu-list="" />
    </MenuPopover>
  );
});

MenuList.displayName = "MenuList";
if (__DEV__) {
  MenuList.propTypes = {
    children: PropTypes.node.isRequired
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuPopover

export const MenuPopover = forwardRef(function MenuPopover(
  { children, onBlur, style, ...props },
  forwardedRef
) {
  const {
    buttonRef,
    dispatch,
    menuRef,
    popoverRef,
    state: { isOpen }
  } = useMenuContext();

  const ref = useForkedRef(popoverRef, forwardedRef);

  function handleBlur(event) {
    const { relatedTarget } = event;
    requestAnimationFrame(() => {
      // We on want to close only if focus rests outside the menu
      if (
        document.activeElement !== menuRef.current &&
        document.activeElement !== buttonRef.current &&
        popoverRef.current
      ) {
        if (
          !popoverRef.current.contains(relatedTarget || document.activeElement)
        ) {
          dispatch({ type: CLOSE_MENU });
        }
      }
    });
  }
  return (
    <Popover
      {...props}
      ref={ref}
      data-reach-menu="" // deprecate for naming consistency?
      data-reach-menu-popover=""
      hidden={!isOpen}
      onBlur={wrapEvent(onBlur, handleBlur)}
      targetRef={buttonRef}
    >
      {children}
    </Popover>
  );
});

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
function findItemFromSearch(items, string = "") {
  if (!string) {
    return null;
  }

  const found = items.find(
    search => search && search.toLowerCase().startsWith(string)
  );
  return found ? items.indexOf(found) : null;
}

/**
 * MenuItem or MenuLink components should likely have a plain string passed as a
 * child (or perhaps nested as a child somewhere in its tree). This function
 * searches for child props recurssively to identify the text string if it
 * exists, otherwise a valueText prop should be passed for keyboard nav to work.
 */
function recursivelyFindStringChild(children) {
  const childrenArray = Children.toArray(children);
  for (let i = 0; i <= childrenArray.length; i++) {
    let child = childrenArray[i];

    if (typeof child === "string") {
      return child;
    }

    if (child && child.props && child.props.children) {
      let grandChild = recursivelyFindStringChild(child.props.children);
      if (grandChild) {
        return grandChild;
      }
    }
  }
  return false;
}

function reducer(state, action = {}) {
  const { payload, type: actionType } = action;
  switch (actionType) {
    case CLICK_MENU_ITEM:
      /*
       * Focus the button first by default when an item is selected. We fire the
       * onSelect callback next so the app can manage focus if needed.
       */
      if (payload && payload.buttonRef && payload.buttonRef.current) {
        payload.buttonRef.current.focus();
      }
      if (payload && payload.callback) {
        payload.callback();
      }
      return {
        ...state,
        isOpen: false,
        selectionIndex: -1
      };
    case CLOSE_MENU:
      if (payload && payload.buttonRef && payload.buttonRef.current) {
        payload.buttonRef.current.focus();
      }
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
      if (payload != null && payload >= 0) {
        return {
          ...state,
          selectionIndex: payload
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
        buttonId: payload
      };
    case SEARCH_FOR_ITEM:
      if (typeof payload !== "undefined") {
        return {
          ...state,
          searchQuery: payload
        };
      }
      return state;
    default:
      return state;
  }
}

/**
 * This hook allows us to manage focus for the menu. When a new selection is
 * made the item should receive focus. When no item is selected focus is placed
 * on the menu itself so that keyboard navigation is still possible.
 * Since either a MenuItem or a MenuLink component can be registered as valid
 * menu items, and since we cannot call hooks conditionally, we pass a third
 * parameter to exclude all of our hook logic altogether for MenuItem components
 * that serve as wrappers for MenuLink components.
 */
function useMenuItemFocus(ref, index, exclude = false) {
  const {
    menuRef,
    state: { isOpen, selectionIndex }
  } = useMenuContext();
  useLayoutEffect(() => {
    if (!exclude) {
      if (isOpen) {
        window.__REACH_DISABLE_TOOLTIPS = true;
        window.requestAnimationFrame(() => {
          if (selectionIndex !== -1) {
            /*
             * We haven't measured the popover yet, so give it a frame otherwise
             * we'll scroll to the bottom of the page >.<
             */
            if (ref.current && index === selectionIndex) {
              ref.current.focus();
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
        window.__REACH_DISABLE_TOOLTIPS = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exclude, index, isOpen, selectionIndex]);
}

/**
 * This hook registers our menu item by passing it into an array and returning
 * its index.
 *
 * https://github.com/reach/reach-ui/blob/dev-descendants/packages/descendants/src/index.js
 *
 * We use this for focus management and keyboard navigation. As with
 * the hook above, MenuItem components that wrap MenuLink components are skipped
 * with the exclude param so we don't count them twice!
 */
function useMenuDescendant(valueText, exclude = false) {
  const index = useRef(null);
  const { assigningItems, itemsRef } = useMenuContext();

  useLayoutEffect(() => {
    if (assigningItems.current && !exclude) {
      index.current = itemsRef.current.push(valueText) - 1;
    }
  });

  return index.current;
}
