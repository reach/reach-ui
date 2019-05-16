import React, { createContext, Children } from "react";
import Portal from "@reach/portal";
import Rect from "@reach/rect";
import WindowSize from "@reach/window-size";
import Component from "@reach/component-component";
import { node, func, object, string, number, oneOfType, any } from "prop-types";
import {
  wrapEvent,
  checkStyles,
  assignRef,
  disableTooltips,
  enableTooltips
} from "@reach/utils";

let { Provider, Consumer } = createContext();

let checkIfAppManagedFocus = ({ refs, state, prevState }) => {
  if (!state.isOpen && prevState.isOpen) {
    return !refs.menu.contains(document.activeElement);
  }
  return false;
};

let manageFocusOnUpdate = ({ refs, state, prevState }, appManagedFocus) => {
  if (state.isOpen && !prevState.isOpen) {
    disableTooltips();
    if (state.selectionIndex !== -1) {
      // haven't measured the popover yet, give it a frame otherwise
      // we'll scroll to the bottom of the page >.<
      requestAnimationFrame(() => {
        refs.items[state.selectionIndex].focus();
      });
    } else {
      refs.menu.focus();
    }
  } else if (!state.isOpen && prevState.isOpen) {
    if (!appManagedFocus) {
      refs.button.focus();
    }
    enableTooltips();
  } else if (state.selectionIndex !== prevState.selectionIndex) {
    if (state.selectionIndex === -1) {
      // clear highlight when mousing over non-menu items, but focus the menu
      // so the the keyboard will work after a mouseover
      refs.menu.focus();
    } else {
      refs.items[state.selectionIndex].focus();
    }
  }
};

let openAtFirstItem = state => ({ isOpen: true, selectionIndex: 0 });

let close = state => ({
  isOpen: false,
  selectionIndex: -1,
  closingWithClick: false
});

let selectItemAtIndex = index => state => ({
  selectionIndex: index
});

let genId = prefix =>
  `${prefix}-${Math.random()
    .toString(32)
    .substr(2, 8)}`;

////////////////////////////////////////////////////////////////////////
let getMenuRefs = () => ({
  button: null,
  menu: null,
  items: []
});

let getInitialMenuState = () => ({
  isOpen: false,
  buttonRect: undefined,
  selectionIndex: -1,
  closingWithClick: false,
  buttonId: genId("button")
});

let checkIfStylesIncluded = () => checkStyles("menu-button");

let Menu = ({ children }) => (
  <Component
    getRefs={getMenuRefs}
    getInitialState={getInitialMenuState}
    didMount={checkIfStylesIncluded}
    didUpdate={manageFocusOnUpdate}
    getSnapshotBeforeUpdate={checkIfAppManagedFocus}
  >
    {context => (
      <Provider value={context}>
        {typeof children === "function"
          ? children({ isOpen: context.state.isOpen })
          : children}
      </Provider>
    )}
  </Component>
);

Menu.propTypes = {
  children: oneOfType([func, node])
};

////////////////////////////////////////////////////////////////////////
let MenuButton = React.forwardRef(
  ({ onClick, onKeyDown, onMouseDown, ...props }, ref) => (
    <Consumer>
      {({ refs, state, setState }) => (
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
                rectRef(node);
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
      )}
    </Consumer>
  )
);

MenuButton.propTypes = {
  onClick: func,
  onKeyDown: func,
  children: node
};

let MenuItem = React.forwardRef(
  (
    {
      onSelect,
      onClick,
      role = "menuitem",
      state,
      setState,
      index,
      onKeyDown,
      onMouseMove,
      onMouseLeave,
      _ref,
      ...rest
    },
    ref
  ) => {
    let isSelected = index === state.selectionIndex;
    let select = () => {
      onSelect();
      setState(close);
    };
    return (
      <div
        {...rest}
        ref={node => {
          assignRef(ref, node);
          assignRef(_ref, node);
        }}
        data-reach-menu-item={role === "menuitem" ? true : undefined}
        role={role}
        tabIndex="-1"
        data-selected={role === "menuitem" && isSelected ? true : undefined}
        onClick={wrapEvent(onClick, event => {
          select();
        })}
        onKeyDown={wrapEvent(onKeyDown, event => {
          if (event.key === "Enter") {
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

MenuItem.propTypes = {
  onSelect: func.isRequired,
  onClick: func,
  role: string,
  state: object,
  setState: func,
  index: number,
  onKeyDown: func,
  onMouseMove: func,
  _ref: func
};

let k = () => {};

////////////////////////////////////////////////////////////////////////
let MenuLink = React.forwardRef(
  (
    {
      onKeyDown,
      onClick,
      component: Comp,
      as: AsComp = "a",
      style,
      setState,
      state,
      index,
      _ref,
      ...props
    },
    ref
  ) => {
    const Link = Comp || AsComp;
    if (Comp) {
      console.warn(
        "[@reach/menu-button]: Please use the `as` prop instead of `component`."
      );
    }
    return (
      <MenuItem
        role="none"
        state={state}
        setState={setState}
        index={index}
        onSelect={k}
        _ref={k}
      >
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
          ref={node => {
            assignRef(_ref, node);
            assignRef(ref, node);
          }}
          style={{ ...style }}
          {...props}
        />
      </MenuItem>
    );
  }
);

MenuLink.propTypes = {
  onKeyDown: func,
  onClick: func,
  component: any,
  as: any,
  style: object,
  setState: func,
  state: object,
  index: number,
  _ref: func
};
///////////////////////////////////////////////////////////////////

let MenuList = React.forwardRef((props, ref) => (
  <Consumer>
    {({ refs, state, setState }) =>
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
                    <MenuListImpl
                      {...props}
                      setState={setState}
                      state={state}
                      refs={refs}
                      ref={ref}
                    />
                  </div>
                )}
              </Rect>
            )}
          </WindowSize>
        </Portal>
      )
    }
  </Consumer>
));

MenuList.propTypes = {
  children: node
};

let focusableChildrenTypes = [MenuItem, MenuLink];

let isFocusableChildType = child => focusableChildrenTypes.includes(child.type);
let getFocusableMenuChildren = children => {
  let focusable = [];
  Children.forEach(children, child => {
    if (isFocusableChildType(child)) focusable.push(child);
  });
  return focusable;
};

let MenuListImpl = React.forwardRef(
  ({ refs, state, setState, children, onKeyDown, onBlur, ...rest }, ref) => {
    let focusableChildren = getFocusableMenuChildren(children);
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
            !refs.menu.contains(event.relatedTarget)
          ) {
            setState(close);
          }
        }}
        onKeyDown={wrapEvent(onKeyDown, event => {
          if (event.key === "Escape") {
            setState(close);
          } else if (event.key === "ArrowDown") {
            event.preventDefault(); // prevent window scroll
            let nextIndex = state.selectionIndex + 1;
            if (nextIndex !== focusableChildren.length) {
              setState({ selectionIndex: nextIndex });
            }
          } else if (event.key === "ArrowUp") {
            event.preventDefault(); // prevent window scroll
            let nextIndex = state.selectionIndex - 1;
            if (nextIndex !== -1) {
              setState({ selectionIndex: nextIndex });
            }
          } else if (event.key === "Tab") {
            event.preventDefault(); // prevent leaving
          }
        })}
      >
        {Children.map(children, (child, index) => {
          if (isFocusableChildType(child)) {
            let focusIndex = focusableChildren.indexOf(child);

            return React.cloneElement(child, {
              setState,
              state,
              index: focusIndex,
              _ref: node => (refs.items[focusIndex] = node)
            });
          }

          return child;
        })}
      </div>
    );
  }
);

MenuListImpl.propTypes = {
  refs: object,
  state: object,
  setState: func,
  children: node,
  onKeyDown: func,
  onBlur: func
};

let getStyles = (buttonRect, menuRect) => {
  let haventMeasuredButtonYet = !buttonRect;
  if (haventMeasuredButtonYet) {
    return { opacity: 0 };
  }

  let haventMeasuredMenuYet = !menuRect;

  let styles = {
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

  let collisions = {
    top: buttonRect.top - menuRect.height < 0,
    right: window.innerWidth < buttonRect.left + menuRect.width,
    bottom: window.innerHeight < buttonRect.top + menuRect.height,
    left: buttonRect.left - menuRect.width < 0
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
