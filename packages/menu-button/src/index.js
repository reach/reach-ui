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

  return (
    <button
      id={state.buttonId}
      aria-haspopup="menu"
      aria-expanded={state.isOpen}
      data-reach-menu-button
      type="button"
      ref={node => {
        assignRef(forwardedRef, node);
        assignRef(ownRef, node);
        refs.button = node;
      }}
      onMouseDown={wrapEvent(onMouseDown, () => {
        if (state.isOpen) {
          setState({ closingWithClick: true });
        }
      })}
      onClick={wrapEvent(onClick, () => {
        if (state.isOpen) {
          setState(close);
        } else {
          setState(openAtFirstItem);
        }
      })}
      onKeyDown={wrapEvent(onKeyDown, event => {
        if (event.key === "ArrowDown") {
          event.preventDefault(); // prevent scroll
          setState(openAtFirstItem);
        } else if (event.key === "ArrowUp") {
          event.preventDefault(); // prevent scroll
          setState(openAtFirstItem);
        }
      })}
      {...props}
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
    onClick,
    onKeyDown,
    onMouseLeave,
    onMouseMove,
    onSelect,
    role = "menuitem",
    _index: index,
    _ref = null,
    ...rest
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
  return (
    <div
      {...rest}
      ref={ref}
      data-reach-menu-item={role === "menuitem" ? true : undefined}
      role={role}
      tabIndex={-1}
      data-selected={role === "menuitem" && isSelected ? true : undefined}
      onClick={wrapEvent(onClick, event => {
        select();
      })}
      onKeyDown={wrapEvent(onKeyDown, event => {
        if (event.key === "Enter" || event.key === " ") {
          // prevent the button from being "clicked" by
          // this "Enter" keydown
          event.preventDefault();
          select();
        }
      })}
      onMouseMove={wrapEvent(onMouseMove, event => {
        if (!isSelected) {
          setState(selectItemAtIndex(index));
        }
      })}
      onMouseLeave={wrapEvent(onMouseLeave, event => {
        // clear out selection when mouse over a non-menu item child
        setState({ selectionIndex: -1 });
      })}
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
  const ownRef = useRef(null);
  const ref = useForkedRef(_ref, forwardedRef, ownRef);
  if (Comp) {
    console.warn(
      "[@reach/menu-button]: Please use the `as` prop instead of `component`."
    );
  }
  return (
    <MenuItem role="none" onSelect={noop} _index={index} _ref={noop}>
      <Link
        role="menuitem"
        data-reach-menu-item
        tabIndex={-1}
        data-selected={index === state.selectionIndex ? true : undefined}
        onClick={wrapEvent(onClick, event => {
          setState(close);
        })}
        onKeyDown={wrapEvent(onKeyDown, event => {
          if (event.key === "Enter") {
            // prevent MenuItem's preventDefault from firing,
            // allowing this link to work w/ the keyboard
            event.stopPropagation();
          }
        })}
        ref={ref}
        {...props}
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
              data-reach-menu-popover
              data-reach-menu // deprecate for naming consistency?
              ref={node => {
                assignRef(ref, node);
                assignRef(forwardedRef, node);
              }}
              {...props}
              style={{
                ...style,
                ...getStyles(state.buttonRect, menuRect)
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
      <MenuItems {...props} data-reach-menu-list="" ref={ref} />
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
  { children, onKeyDown, onBlur, ...rest },
  ref
) {
  const { state, setState, refs } = useContext(MenuContext);
  const clones = Children.toArray(children).filter(Boolean);
  const focusableChildren = clones.filter(child => isFocusableChildType(child));

  return (
    <div
      data-reach-menu-items
      {...rest}
      role="menu"
      aria-labelledby={state.buttonId}
      tabIndex={-1}
      ref={node => {
        refs.menu = node;
        assignRef(ref, node);
      }}
      onBlur={event => {
        if (
          !state.closingWithClick &&
          !refs.menu.contains(event.relatedTarget || document.activeElement)
        ) {
          setState(close);
        }
      }}
      onKeyDown={wrapEvent(onKeyDown, event => {
        if (event.key === "Escape") {
          setState(close);
        } else if (event.key === "ArrowDown") {
          event.preventDefault(); // prevent window scroll
          const nextIndex = state.selectionIndex + 1;
          if (nextIndex !== focusableChildren.length) {
            setState({ selectionIndex: nextIndex });
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault(); // prevent window scroll
          const nextIndex = state.selectionIndex - 1;
          if (nextIndex !== -1) {
            setState({ selectionIndex: nextIndex });
          }
        } else if (event.key === "Tab") {
          event.preventDefault(); // prevent leaving
        }
      })}
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
