import React, { createContext } from "react";
import Portal from "@reach/portal";
import { Link } from "@reach/router";
import Rect from "@reach/rect";
import WindowSize from "@reach/window-size";
import Component from "@reach/component-component";
import { node, func, object, string, number, oneOfType } from "prop-types";
import { wrapEvent, checkStyles } from "@reach/utils";

let { Provider, Consumer } = createContext();

let checkIfAppManagedFocus = ({ refs, state, prevState }) => {
  if (!state.isOpen && prevState.isOpen) {
    return !refs.menu.contains(document.activeElement);
  }
  return false;
};

let manageFocusOnUpdate = ({ refs, state, prevState }, appManagedFocus) => {
  if (state.isOpen && !prevState.isOpen) {
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
  } else if (state.selectionIndex !== prevState.selectionIndex) {
    refs.items[state.selectionIndex].focus();
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
let MenuButton = React.forwardRef(({ onClick, onKeyDown, ...props }, ref) => (
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
              ref && ref(node);
              refs.button = node;
            }}
            onMouseDown={event => {
              if (state.isOpen) {
                setState({ closingWithClick: true });
              }
            }}
            onClick={wrapEvent(onClick, event => {
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
));

MenuButton.propTypes = {
  onClick: func,
  onKeyDown: func,
  children: node
};

////////////////////////////////////////////////////////////////////////

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

let MenuListImpl = React.forwardRef(
  ({ refs, state, setState, children, onKeyDown, onBlur, ...rest }, ref) => (
    <div
      data-reach-menu-list
      {...rest}
      role="menu"
      aria-labelledby={state.buttonId}
      tabIndex="-1"
      ref={node => {
        refs.menu = node;
        ref && ref(node);
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
          if (nextIndex !== React.Children.count(children)) {
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
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          setState,
          state,
          index,
          _ref: node => (refs.items[index] = node)
        });
      })}
    </div>
  )
);

MenuListImpl.propTypes = {
  refs: object,
  state: object,
  setState: func,
  children: node,
  onKeyDown: func,
  onBlur: func
};

////////////////////////////////////////////////////////////////////////
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
          ref && ref(node);
          _ref(node);
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
      component: Comp = Link,
      style,
      setState,
      state,
      index,
      _ref,
      ...props
    },
    ref
  ) => (
    <MenuItem
      role="none"
      state={state}
      setState={setState}
      index={index}
      onSelect={k}
      _ref={k}
    >
      <Comp
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
          _ref(node);
          ref && ref(node);
        }}
        style={{ ...style }}
        {...props}
      />
    </MenuItem>
  )
);

MenuLink.propTypes = {
  to: string.isRequired,
  onKeyDown: func,
  onClick: func,
  component: oneOfType([string, node]),
  style: object,
  setState: func,
  state: object,
  index: number,
  _ref: func
};

let getStyles = (buttonRect, menuRect) => {
  let haventMeasuredButtonYet = !buttonRect;
  if (haventMeasuredButtonYet) {
    return { opacity: 0 };
  }

  let haventMeasuredMenuYet = !menuRect;

  let styles = {
    left: `${buttonRect.left + window.scrollX}px`,
    top: `${buttonRect.top + buttonRect.height + window.scrollY}px`
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
      ? `${buttonRect.right - menuRect.width + window.scrollX}px`
      : `${buttonRect.left + window.scrollX}px`,
    top: directionUp
      ? `${buttonRect.top - menuRect.height + window.scrollY}px`
      : `${buttonRect.top + buttonRect.height + window.scrollY}px`
  };
};

export { Menu, MenuList, MenuButton, MenuLink, MenuItem };
