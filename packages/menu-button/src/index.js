import React, { createContext, Children } from "react";
import Portal from "@reach/portal";
import Rect from "@reach/rect";
import WindowSize from "@reach/window-size";
import Component from "@reach/component-component";
import {
  node,
  func,
  object,
  string,
  number,
  oneOfType,
  any,
  bool
} from "prop-types";
import { wrapEvent, checkStyles, assignRef } from "@reach/utils";

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

const openAtFirstItem = state => ({ isOpen: true, selectionIndex: 0 });

const close = state => ({
  isOpen: false,
  selectionIndex: -1,
  closingWithClick: false
});

const selectItemAtIndex = index => state => ({
  selectionIndex: index
});

////////////////////////////////////////////////////////////////////////
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

const Menu = ({ children }) => {
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

if (__DEV__) {
  Menu.propTypes = {
    children: oneOfType([func, node])
  };
}

////////////////////////////////////////////////////////////////////////
const MenuButton = React.forwardRef(
  ({ onClick, onKeyDown, onMouseDown, id, ...props }, forwardedRef) => {
    const { refs, state, setState } = React.useContext(MenuContext);
    const ownRef = React.useRef(null);
    const ref = forwardedRef || ownRef;

    React.useEffect(
      () => setState({ buttonId: id != null ? id : genId() }),
      [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return (
      <Rect
        observe={state.isOpen}
        onChange={buttonRect => setState({ buttonRect })}
      >
        {({ ref: rectRef }) => (
          <button
            id={state.buttonId}
            aria-haspopup="menu"
            aria-expanded={state.isOpen}
            data-reach-menu-button
            type="button"
            ref={node => {
              assignRef(rectRef, node);
              assignRef(ref, node);
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
        )}
      </Rect>
    );
  }
);

if (__DEV__) {
  MenuButton.propTypes = {
    onClick: func,
    onKeyDown: func,
    children: node
  };
}

const MenuItem = React.forwardRef(
  (
    {
      onSelect,
      onClick,
      role = "menuitem",
      onKeyDown,
      onMouseMove,
      onMouseLeave,
      _index: index,
      _ref = null,
      focusable,
      ...rest
    },
    forwardedRef
  ) => {
    const { state, setState } = React.useContext(MenuContext);
    const ownRef = React.useRef(null);
    const ref = useForkedRef(_ref, forwardedRef || ownRef);
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
        tabIndex="-1"
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
  }
);

if (__DEV__) {
  MenuItem.propTypes = {
    focusable: bool,
    onSelect: func.isRequired,
    onClick: func,
    role: string,
    state: object,
    setState: func,
    onKeyDown: func,
    onMouseMove: func,
    _ref: func,
    _index: number
  };
}

////////////////////////////////////////////////////////////////////////
const MenuLink = React.forwardRef(
  (
    {
      onKeyDown,
      onClick,
      component: Comp,
      as: AsComp = "a",
      style,
      _index: index,
      _ref = null,
      focusable,
      ...props
    },
    forwardedRef
  ) => {
    const { state, setState } = React.useContext(MenuContext);
    const Link = Comp || AsComp;
    const ownRef = React.useRef(null);
    const ref = useForkedRef(_ref, forwardedRef || ownRef);
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
          tabIndex="-1"
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
          style={{ ...style }}
          {...props}
        />
      </MenuItem>
    );
  }
);

if (__DEV__) {
  MenuLink.propTypes = {
    onKeyDown: func,
    onClick: func,
    component: any,
    focusable: bool,
    as: any,
    style: object,
    setState: func,
    state: object,
    index: number,
    _ref: func
  };
}
///////////////////////////////////////////////////////////////////

const MenuList = React.forwardRef((props, forwardedRef) => {
  const ownRef = React.useRef(null);
  const ref = ownRef || forwardedRef;
  const { state } = React.useContext(MenuContext);
  return (
    state.isOpen && (
      <Portal>
        <WindowSize>
          {() => (
            <Rect>
              {({ rect: menuRect, ref: menuRef }) => (
                <div
                  data-reach-menu
                  ref={menuRef}
                  style={getStyles(state.buttonRect, menuRect)}
                >
                  <MenuListImpl {...props} ref={ref} />
                </div>
              )}
            </Rect>
          )}
        </WindowSize>
      </Portal>
    )
  );
});

if (__DEV__) {
  MenuList.propTypes = {
    children: node
  };
}

const focusableChildrenTypes = [MenuItem, MenuLink];

const isFocusableChildType = child =>
  focusableChildrenTypes.includes(child.type);

const getFocusableMenuChildren = childrenArray => {
  const focusable = childrenArray.filter(child => isFocusableChildType(child));
  return focusable;
};

const MenuListImpl = React.forwardRef(
  ({ children, onKeyDown, onBlur, ...rest }, ref) => {
    const { state, setState, refs } = React.useContext(MenuContext);
    const clones = Children.toArray(children).filter(Boolean);
    const focusableChildren = getFocusableMenuChildren(clones);

    return (
      <div
        data-reach-menu-list
        {...rest}
        role="menu"
        aria-labelledby={state.buttonId}
        tabIndex="-1"
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
        {clones.map((child, index) => {
          if (isFocusableChildType(child)) {
            const focusIndex = focusableChildren.indexOf(child);

            return React.cloneElement(child, {
              _index: focusIndex,
              _ref: node => (refs.items[focusIndex] = node)
            });
          }

          return child;
        })}
      </div>
    );
  }
);

if (__DEV__) {
  MenuListImpl.propTypes = {
    refs: object,
    state: object,
    setState: func,
    children: node,
    onKeyDown: func,
    onBlur: func
  };
}

const getStyles = (buttonRect, menuRect) => {
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
};

export { Menu, MenuList, MenuButton, MenuLink, MenuItem };

// TODO: Remove and import from @reach/utils once it's been added to the package
function useForkedRef(...refs) {
  return React.useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null;
    }
    return node => {
      refs.forEach(ref => {
        assignRef(ref, node);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
