import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef
} from "react";
import Portal from "@reach/portal";
import Rect, { useRect } from "@reach/rect";
import Component from "@reach/component-component";
import PropTypes from "prop-types";
import { wrapEvent, checkStyles, assignRef, useForkedRef } from "@reach/utils";

const noop = () => {};
let id = 0;
const genId = () => `button-${++id}`;

// TODO: add the mousedown/drag/mouseup to select of native menus, will
// also help w/ remove the menu button tooltip hide-flash.

// TODO: add type-to-highlight like native menus

const MenuContext = createContext();

const checkIfAppManagedFocus = ({ refs, state, prevState }) => {
  if (!state.isOpen && prevState.isOpen) {
    return !refs.menu.contains(document.activeElement);
  }
  return false;
};

const manageFocusOnUpdate = ({ refs, state, prevState }, appManagedFocus) => {
  if (state.isOpen && !prevState.isOpen) {
    window.__REACH_DISABLE_TOOLTIPS = true;
    if (state.selectionIndex !== -1) {
      // haven't measured the popover yet, give it a frame otherwise
      // we'll scroll to the bottom of the page >.<
      requestAnimationFrame(() => {
        if (refs.items && refs.items[state.selectionIndex]) {
          refs.items[state.selectionIndex].focus();
        }
      });
    } else {
      refs.menu.focus();
    }
  } else if (!state.isOpen && prevState.isOpen) {
    if (!appManagedFocus) {
      refs.button && refs.button.focus();
    }
    // we want to ignore the immediate focus of a tooltip so it doesn't pop
    // up again when the menu closes, only pops up when focus returns again
    // to the tooltip (like native OS tooltips)
    window.__REACH_DISABLE_TOOLTIPS = false;
  } else if (state.selectionIndex !== prevState.selectionIndex) {
    if (state.selectionIndex === -1) {
      // clear highlight when mousing over non-menu items, but focus the menu
      // so the the keyboard will work after a mouseover
      refs.menu && refs.menu.focus();
    } else if (refs.items && refs.items[state.selectionIndex]) {
      refs.items[state.selectionIndex].focus();
    }
  }
};

const openAtFirstItem = _ => ({ isOpen: true, selectionIndex: 0 });

const close = _ => ({
  isOpen: false,
  selectionIndex: -1,
  closingWithClick: false
});

const selectItemAtIndex = index => _ => ({
  selectionIndex: index
});

const getMenuRefs = () => ({
  button: null,
  menu: null,
  items: []
});

const getInitialMenuState = () => ({
  buttonId: null,
  isOpen: false,
  buttonRect: undefined,
  selectionIndex: -1,
  closingWithClick: false
});

const checkIfStylesIncluded = () => checkStyles("menu-button");

////////////////////////////////////////////////////////////////////////////////
// Menu

export const Menu = ({ children }) => {
  return (
    <Component
      getRefs={getMenuRefs}
      getInitialState={getInitialMenuState}
      didMount={checkIfStylesIncluded}
      didUpdate={manageFocusOnUpdate}
      getSnapshotBeforeUpdate={checkIfAppManagedFocus}
    >
      {context => (
        <MenuContext.Provider value={{ ...context }}>
          {typeof children === "function"
            ? children({ isOpen: context.state.isOpen })
            : children}
        </MenuContext.Provider>
      )}
    </Component>
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
  { onClick, onKeyDown, onMouseDown, id, ...props },
  forwardedRef
) {
  const { refs, state, setState } = useContext(MenuContext);
  const ownRef = useRef(null);

  useRect(ownRef, state.isOpen, buttonRect => setState({ buttonRect }));

  useEffect(
    () => setState({ buttonId: id != null ? id : genId() }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function handleClick() {
    if (state.isOpen) {
      setState(close);
    } else {
      setState(openAtFirstItem);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault(); // prevent scroll
      setState(openAtFirstItem);
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); // prevent scroll
      setState(openAtFirstItem);
    }
  }

  function handleMouseDown() {
    if (state.isOpen) {
      setState({ closingWithClick: true });
    }
  }

  return (
    <button
      {...props}
      ref={node => {
        assignRef(forwardedRef, node);
        assignRef(ownRef, node);
        refs.button = node;
      }}
      data-reach-menu-button=""
      aria-expanded={state.isOpen}
      aria-haspopup="menu"
      id={state.buttonId}
      onClick={wrapEvent(onClick, handleClick)}
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
    onClick,
    onKeyDown,
    onMouseLeave,
    onMouseMove,
    onSelect,
    role = "menuitem",
    _index: index,
    _ref = null,
    ...props
  },
  forwardedRef
) {
  const { state, setState } = useContext(MenuContext);
  const ownRef = useRef(null);
  const ref = useForkedRef(_ref, forwardedRef, ownRef);
  const isSelected = index === state.selectionIndex;
  const select = () => {
    onSelect();
    setState(close);
  };

  function handleClick(event) {
    select();
  }

  function handleMouseLeave(event) {
    // clear out selection when mouse over a non-menu item child
    setState({ selectionIndex: -1 });
  }

  function handleMouseMove(event) {
    if (!isSelected) {
      setState(selectItemAtIndex(index));
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      // prevent the button from being "clicked" by
      // this "Enter" keydown
      event.preventDefault();
      select();
    }
  }

  return (
    <Comp
      {...props}
      ref={ref}
      data-reach-menu-item={role === "menuitem" ? true : undefined}
      data-selected={role === "menuitem" && isSelected ? true : undefined}
      onClick={wrapEvent(onClick, handleClick)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
      onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
      role={role}
      tabIndex={-1}
    />
  );
});

MenuItem.displayName = "MenuItem";
if (__DEV__) {
  MenuItem.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    role: PropTypes.string,
    state: PropTypes.object,
    setState: PropTypes.func,
    onKeyDown: PropTypes.func,
    onMouseMove: PropTypes.func,
    _ref: PropTypes.func,
    _index: PropTypes.number
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuLink

export const MenuLink = forwardRef(function MenuLink(
  {
    as: AsComp = "a",
    component: Comp,
    onClick,
    onKeyDown,
    role,
    _index: index,
    _ref = null,
    ...props
  },
  forwardedRef
) {
  const { state, setState } = useContext(MenuContext);
  const Link = Comp || AsComp;
  const ref = useForkedRef(_ref, forwardedRef);

  if (Comp) {
    console.warn(
      "[@reach/menu-button]: Please use the `as` prop instead of `component`."
    );
  }

  function handleClick() {
    setState(close);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      // prevent MenuItem's preventDefault from firing,
      // allowing this link to work w/ the keyboard
      event.stopPropagation();
    }
  }

  return (
    <MenuItem role="none" onSelect={noop} _index={index} _ref={noop}>
      <Link
        {...props}
        ref={ref}
        data-reach-menu-item=""
        data-selected={index === state.selectionIndex ? true : undefined}
        onClick={wrapEvent(onClick, handleClick)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        role="menuitem"
        tabIndex={-1}
      />
    </MenuItem>
  );
});

MenuLink.displayName = "MenuLink";
if (__DEV__) {
  MenuLink.propTypes = {
    as: PropTypes.any,
    component: PropTypes.any,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    _index: PropTypes.number,
    _ref: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuPopover

export const MenuPopover = forwardRef(function MenuPopover(
  { children, style, ...props },
  forwardedRef
) {
  const { state } = useContext(MenuContext);
  return (
    state.isOpen && (
      <Portal>
        <Rect>
          {({ rect: menuRect, ref }) => (
            <div
              {...props}
              ref={node => {
                assignRef(ref, node);
                assignRef(forwardedRef, node);
              }}
              data-reach-menu-popover=""
              data-reach-menu="" // deprecate for naming consistency?
              style={{
                ...getStyles(state.buttonRect, menuRect),
                ...style
              }}
            >
              {children}
            </div>
          )}
        </Rect>
      </Portal>
    )
  );
});

MenuPopover.displayName = "MenuPopover";
if (__DEV__) {
  MenuPopover.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// MenuList

export const MenuList = forwardRef(function MenuList(props, forwardedRef) {
  const ownRef = useRef(null);
  const ref = useForkedRef(ownRef, forwardedRef);
  return (
    <MenuPopover>
      <MenuItems {...props} ref={ref} data-reach-menu-list="" />
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
// MenuItems

export const MenuItems = forwardRef(function MenuItems(
  { children, onKeyDown, onBlur, ...props },
  ref
) {
  const { state, setState, refs } = useContext(MenuContext);
  const clones = Children.toArray(children).filter(Boolean);
  const focusableChildren = clones.filter(child => isFocusableChildType(child));

  function handleBlur(event) {
    if (
      !state.closingWithClick &&
      !refs.menu.contains(event.relatedTarget || document.activeElement)
    ) {
      setState(close);
    }
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "Escape":
        setState(close);
        break;
      case "Home":
        event.preventDefault(); // prevent window scroll
        setState({ selectionIndex: 0 });
        break;
      case "End":
        event.preventDefault(); // prevent window scroll
        setState({
          selectionIndex: focusableChildren.length - 1
        });
        break;
      case "ArrowDown":
        event.preventDefault(); // prevent window scroll
        const nextIndex = state.selectionIndex + 1;
        if (nextIndex !== focusableChildren.length) {
          setState({ selectionIndex: nextIndex });
        }
        break;
      case "ArrowUp":
        event.preventDefault(); // prevent window scroll
        const prevIndex = state.selectionIndex - 1;
        if (prevIndex !== -1) {
          setState({ selectionIndex: prevIndex });
        }
        break;
      case "Tab":
        event.preventDefault(); // prevent leaving
        break;
      default:
        break;
    }
  }

  return (
    <div
      {...props}
      ref={node => {
        refs.menu = node;
        assignRef(ref, node);
      }}
      data-reach-menu-items=""
      aria-labelledby={state.buttonId}
      onBlur={wrapEvent(onBlur, handleBlur)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      role="menu"
      tabIndex={-1}
    >
      {clones.map(child => {
        if (isFocusableChildType(child)) {
          const focusIndex = focusableChildren.indexOf(child);

          return cloneElement(child, {
            _index: focusIndex,
            _ref: node => (refs.items[focusIndex] = node)
          });
        }

        return child;
      })}
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

const focusableChildrenTypes = [MenuItem, MenuLink];

function getStyles(buttonRect, menuRect) {
  const haventMeasuredButtonYet = !buttonRect;
  if (haventMeasuredButtonYet) {
    return { opacity: 0 };
  }

  const haventMeasuredMenuYet = !menuRect;

  const styles = {
    left: `${buttonRect.left + window.pageXOffset}px`,
    top: `${buttonRect.top + buttonRect.height + window.pageYOffset}px`
  };

  if (haventMeasuredMenuYet) {
    return {
      ...styles,
      opacity: 0
    };
  }

  if (buttonRect.width < 500) {
    styles.minWidth = buttonRect.width;
  }

  const collisions = {
    top: buttonRect.top - menuRect.height < 0,
    right: window.innerWidth < buttonRect.left + menuRect.width,
    bottom: window.innerHeight < buttonRect.top + menuRect.height,
    left: buttonRect.left + buttonRect.width - menuRect.width < 0
  };

  const directionRight = collisions.right && !collisions.left;
  const directionUp = collisions.bottom && !collisions.top;

  return {
    ...styles,
    left: directionRight
      ? `${buttonRect.right - menuRect.width + window.pageXOffset}px`
      : `${buttonRect.left + window.pageXOffset}px`,
    top: directionUp
      ? `${buttonRect.top - menuRect.height + window.pageYOffset}px`
      : `${buttonRect.top + buttonRect.height + window.pageYOffset}px`
  };
}

function isFocusableChildType(child) {
  return focusableChildrenTypes.includes(child.type);
}
