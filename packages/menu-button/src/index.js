import React, {
  createContext,
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
import Popover from "@reach/popover";
import {
  checkStyles,
  makeId,
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

const DescendantContext = createContext();
const MenuContext = createContext();
const useDescendantContext = () => useContext(DescendantContext);
const useMenuContext = () => useContext(MenuContext);

const initialState = {
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
// Menu

export const Menu = ({ id, children }) => {
  let buttonRef = useRef(null);
  let menuRef = useRef(null);
  let popoverRef = useRef(null);
  let [descendants, setDescendants] = useDescendants();
  let [state, dispatch] = useReducer(reducer, initialState);
  let menuId = useId(id);

  let context = {
    buttonRef,
    dispatch,
    menuId,
    menuRef,
    popoverRef,
    state
  };

  useEffect(() => checkStyles("menu-button"), []);

  return (
    <DescendantProvider descendants={descendants} set={setDescendants}>
      <MenuContext.Provider value={context}>
        {typeof children === "function"
          ? children({ isOpen: state.isOpen })
          : children}
      </MenuContext.Provider>
    </DescendantProvider>
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
  let {
    buttonRef,
    menuId,
    state: { buttonId, isOpen },
    dispatch
  } = useMenuContext();
  let ref = useForkedRef(buttonRef, forwardedRef);

  useEffect(() => {
    let newButtonId = id != null ? id : makeId("menu-button", menuId);
    if (buttonId !== newButtonId) {
      dispatch({
        type: SET_BUTTON_ID,
        payload: newButtonId
      });
    }
  }, [buttonId, dispatch, id, menuId]);

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

  function handleMouseDown() {
    dispatch({ type: isOpen ? CLOSE_MENU : OPEN_MENU_AT_FIRST_ITEM });
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
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuItemImpl
// MenuItem and MenuLink share most of the same functionality captured here.

const MenuItemImpl = forwardRef(function MenuItemImpl(
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

  let ownRef = useRef(null);

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

  /*
   * By default, we assume valueText is a unique value for all menu items, so it
   * should be sufficient as an unique identifier we can use to find our index.
   * However there may be some use cases where this is not the case and an
   * explicit unique index may be provided by the app.
   */
  let key = indexProp ?? valueText;
  let index = useDescendant(key, ownRef);
  let isSelected = index === selectionIndex;

  function select() {
    dispatch({
      type: CLICK_MENU_ITEM,
      payload: { buttonRef, callback: onSelect }
    });
  }

  function handleClick(event) {
    if (isLink && !isRightClick(event.nativeEvent)) {
      select();
    }
  }

  function handleDragStart(event) {
    /*
     * Because we don't preventDefault on mousedown for links (we need the
     * native click event), clicking and holding on a link triggers a dragstart
     * which we don't want.
     */
    if (isLink) {
      event.preventDefault();
    }
  }

  function handleKeyDown(event) {
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

  function handleMouseDown(event) {
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

  function handleMouseEnter(event) {
    if (!isSelected && index != null) {
      dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index } });
    }
  }

  function handleMouseLeave(event) {
    // Clear out selection when mouse over a non-menu item child.
    dispatch({ type: CLEAR_SELECTION_INDEX });
  }

  function handleMouseMove(event) {
    if (!isSelected && index != null) {
      dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index } });
    }
  }

  function handleMouseUp(event) {
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
});

////////////////////////////////////////////////////////////////////////////////
// MenuItem

export const MenuItem = forwardRef(function MenuItem(
  { as = "div", ...props },
  forwardedRef
) {
  return <MenuItemImpl {...props} ref={forwardedRef} as={as} />;
});

MenuItem.displayName = "MenuItem";
if (__DEV__) {
  MenuItem.propTypes = {
    as: PropTypes.any,
    onSelect: PropTypes.func.isRequired
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuItems

export const MenuItems = forwardRef(function MenuItems(
  { children, onKeyDown, onBlur, ...props },
  forwardedRef
) {
  const {
    dispatch,
    buttonRef,
    menuRef,
    state: { isOpen, buttonId, selectionIndex, typeaheadQuery }
  } = useMenuContext();
  const { descendants: menuItems } = useDescendantContext();
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
      () => typeaheadQuery && dispatch({ type: SEARCH_FOR_ITEM, payload: "" }),
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
        payload: { index: menuItems.findIndex(i => i.key === prevSelected.key) }
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

  function handleKeyDown(event) {
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
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index: nextIndex } });
        break;
      case "ArrowUp":
        // prevent window scroll
        event.preventDefault();
        const prevIndex = Math.max(selectionIndex - 1, 0);
        dispatch({ type: SELECT_ITEM_AT_INDEX, payload: { index: prevIndex } });
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
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuLink

export const MenuLink = forwardRef(function MenuLink(
  { as = "a", component, ...props },
  forwardedRef
) {
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
        as={component || as}
        isLink={true}
      />
    </div>
  );
});

MenuLink.displayName = "MenuLink";
if (__DEV__) {
  MenuLink.propTypes = {
    as: PropTypes.any,
    component: PropTypes.any,
    onSelect: PropTypes.func
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
  return isOpen ? (
    <Popover
      {...props}
      ref={ref}
      data-reach-menu="" // deprecate for naming consistency?
      data-reach-menu-popover=""
      onBlur={wrapEvent(onBlur, handleBlur)}
      targetRef={buttonRef}
    >
      {children}
    </Popover>
  ) : null;
});

MenuPopover.displayName = "MenuPopover";
if (__DEV__) {
  MenuPopover.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * This hook registers our menu item by passing it into an array. We can then
 * search that array by a unique key to find its index. We use this for focus
 * management and keyboard navigation.
 */
function useDescendant(key, ref) {
  // If the key is a number, it's coming from an index prop.
  let indexProp = typeof key === "number" ? key : undefined;
  let [index, setIndex] = useState(indexProp ?? -1);
  let {
    descendants,
    registerDescendant,
    deregisterDescendant
  } = useDescendantContext();

  useEffect(() => {
    // Descendants require a unique key. Skip updates if none exists.
    if (key == null) {
      return;
    }

    registerDescendant(key, ref);
    return () => void deregisterDescendant(key);
  }, [ref, registerDescendant, deregisterDescendant, key]);

  useEffect(() => {
    if (indexProp == null) {
      let newIndex = descendants.findIndex(i => i.key === key);
      if (newIndex !== index) {
        setIndex(newIndex);
      }
    }
  }, [descendants, key, index, indexProp]);

  if (indexProp != null && indexProp !== index) {
    setIndex(indexProp);
  }

  return index;
}

function useDescendants() {
  return useState([]);
}

function DescendantProvider({ children, descendants, set }) {
  let registerDescendant = useCallback(
    (key, ref) => {
      set(items => {
        let newItem = { key, ref };

        /*
         * When registering a descendant, we need to make sure we insert in into
         * the array in the same order that it appears in the DOM. So as new
         * descendants are added or maybe some are removed, we always know that
         * the array is up-to-date and correct.
         *
         * So here we look at our registered descendants and see if the new
         * element we are adding appears earlier than an existing descendant's DOM
         * node via `node.compareDocumentPosition`. If it does, we insert the new
         * element at this index. Because `registerDescendant` will be called in
         * an effect every time the descendants state value changes, we should be
         * sure that this index is accurate when descendent elements come or go
         * from our component.
         */
        let index = items.findIndex(el => {
          if (!el.ref.current || !ref.current) {
            return false;
          }
          /*
           * Does this element's DOM node appear before another item in the array
           * in our DOM tree? If so, return true to grab the index at this point
           * in the array so we know where to insert the new element.
           */
          return Boolean(
            el.ref.current.compareDocumentPosition(ref.current) &
              Node.DOCUMENT_POSITION_PRECEDING
          );
        });

        // If an index is not found we will push the element to the end.
        if (index === -1) {
          return [...items, newItem];
        }
        return [...items.slice(0, index), newItem, ...items.slice(index)];
      });
    },
    [set]
  );

  let deregisterDescendant = useCallback(
    key => {
      set(items => items.filter(el => el.key !== key));
    },
    [set]
  );

  return (
    <DescendantContext.Provider
      value={{
        descendants,
        registerDescendant,
        deregisterDescendant
      }}
    >
      {children}
    </DescendantContext.Provider>
  );
}

////////////////////////////////////////////////////////////////////////////////

/**
 * When a user's typed input matches the string displayed in a menu item, it is
 * expected that the matching menu item is selected. This is our matching
 * function.
 */
function findItemFromTypeahead(items, string = "") {
  if (!string) {
    return null;
  }

  const found = items.find(({ ref }) =>
    ref?.current?.dataset?.valuetext?.toLowerCase().startsWith(string)
  );
  return found ? items.indexOf(found) : null;
}

function isRightClick(nativeEvent) {
  if ("which" in nativeEvent) {
    return nativeEvent.which === 3;
  } else if ("button" in nativeEvent) {
    return nativeEvent.button === 2;
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
      if (payload != null && payload.index >= 0) {
        return {
          ...state,
          selectionIndex: payload.max
            ? Math.min(Math.max(payload.index, 0), payload.max)
            : Math.max(payload.index, 0)
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
          typeaheadQuery: payload
        };
      }
      return state;
    default:
      return state;
  }
}
