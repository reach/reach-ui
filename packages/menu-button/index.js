"use strict";

exports.__esModule = true;
exports.MenuItem = exports.MenuLink = exports.MenuButton = exports.MenuList = exports.Menu = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _portal = require("@reach/portal");

var _portal2 = _interopRequireDefault(_portal);

var _router = require("@reach/router");

var _rect = require("@reach/rect");

var _rect2 = _interopRequireDefault(_rect);

var _windowSize = require("@reach/window-size");

var _windowSize2 = _interopRequireDefault(_windowSize);

var _componentComponent = require("@reach/component-component");

var _componentComponent2 = _interopRequireDefault(_componentComponent);

var _propTypes = require("prop-types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _createContext = (0, _react.createContext)(),
    Provider = _createContext.Provider,
    Consumer = _createContext.Consumer;

var wrapEvent = function wrapEvent(handler, cb) {
  return function (event) {
    handler && handler(event);
    if (!event.defaultPrevented) {
      return cb(event);
    }
  };
};

var checkIfAppManagedFocus = function checkIfAppManagedFocus(_ref2) {
  var refs = _ref2.refs,
      state = _ref2.state,
      prevState = _ref2.prevState;

  if (!state.isOpen && prevState.isOpen) {
    return !refs.menu.contains(document.activeElement);
  }
  return false;
};

var manageFocusOnUpdate = function manageFocusOnUpdate(_ref3, appManagedFocus) {
  var refs = _ref3.refs,
      state = _ref3.state,
      prevState = _ref3.prevState;

  if (state.isOpen && !prevState.isOpen) {
    if (state.selectionIndex !== -1) {
      // haven't measured the popover yet, give it a frame otherwise
      // we'll scroll to the bottom of the page >.<
      requestAnimationFrame(function () {
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

var openAtFirstItem = function openAtFirstItem(state) {
  return { isOpen: true, selectionIndex: 0 };
};

var close = function close(state) {
  return {
    isOpen: false,
    selectionIndex: -1,
    closingWithClick: false
  };
};

var selectItemAtIndex = function selectItemAtIndex(index) {
  return function (state) {
    return {
      selectionIndex: index
    };
  };
};

var genId = function genId(prefix) {
  return prefix + "-" + Math.random().toString(32).substr(2, 8);
};

////////////////////////////////////////////////////////////////////////
var getMenuRefs = function getMenuRefs() {
  return {
    button: null,
    menu: null,
    items: []
  };
};

var getInitialMenuState = function getInitialMenuState() {
  return {
    isOpen: false,
    buttonRect: undefined,
    selectionIndex: -1,
    closingWithClick: false,
    menuId: genId("menu"),
    buttonId: genId("button")
  };
};

var _checkIfStylesIncluded = function checkIfStylesIncluded() {
  if (parseInt(window.getComputedStyle(document.body).getPropertyValue("--reach-menu"), 10) !== 1) {
    console.warn("@reach/menu-button styles not found. If you are using a bundler like webpack or parcel include this in the entry file of your app before any of your own styles:\n\n    import \"@reach/menu-button/styles.css\";\n\n  Otherwise you'll need to include them some other way:\n\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"node_modules/@reach/menu-button/styles.css\" />\n\n  For more information visit https://ui.reach.tech/styles.\n  ");
  }

  // only do this once
  _checkIfStylesIncluded = function checkIfStylesIncluded() {};
};

var Menu = function Menu(_ref4) {
  var children = _ref4.children;
  return _react2.default.createElement(
    _componentComponent2.default,
    {
      getRefs: getMenuRefs,
      getInitialState: getInitialMenuState,
      didMount: _checkIfStylesIncluded,
      didUpdate: manageFocusOnUpdate,
      getSnapshotBeforeUpdate: checkIfAppManagedFocus
    },
    function (context) {
      return _react2.default.createElement(
        Provider,
        { value: context },
        children
      );
    }
  );
};

process.env.NODE_ENV !== "production" ? Menu.propTypes = {
  children: _propTypes.node
} : void 0;

////////////////////////////////////////////////////////////////////////
var MenuButton = _react2.default.forwardRef(function (_ref5, _ref8) {
  var onClick = _ref5.onClick,
      onKeyDown = _ref5.onKeyDown,
      props = _objectWithoutProperties(_ref5, ["onClick", "onKeyDown"]);

  return _react2.default.createElement(
    Consumer,
    null,
    function (_ref6) {
      var refs = _ref6.refs,
          state = _ref6.state,
          setState = _ref6.setState;
      return _react2.default.createElement(
        _rect2.default,
        {
          observe: state.isOpen,
          onChange: function onChange(buttonRect) {
            return setState({ buttonRect: buttonRect });
          }
        },
        function (_ref7) {
          var rectRef = _ref7.ref;
          return _react2.default.createElement("button", _extends({
            id: state.buttonId,
            "aria-haspopup": "true",
            "aria-controls": state.menuId,
            "aria-expanded": state.isOpen,
            type: "button",
            ref: function ref(node) {
              rectRef(node);
              _ref8 && _ref8(node);
              refs.button = node;
            },
            onMouseDown: function onMouseDown(event) {
              if (state.isOpen) {
                setState({ closingWithClick: true });
              }
            },
            onClick: wrapEvent(onClick, function (event) {
              if (state.isOpen) {
                setState(close);
              } else {
                setState(openAtFirstItem);
              }
            }),
            onKeyDown: wrapEvent(onKeyDown, function (event) {
              if (event.key === "ArrowDown") {
                event.preventDefault(); // prevent scroll
                setState(openAtFirstItem);
              } else if (event.key === "ArrowUp") {
                event.preventDefault(); // prevent scroll
                setState(openAtFirstItem);
              }
            })
          }, props));
        }
      );
    }
  );
});

MenuButton.propTypes = {
  onClick: _propTypes.func,
  onKeyDown: _propTypes.func
};

////////////////////////////////////////////////////////////////////////

var MenuList = function MenuList(props) {
  return _react2.default.createElement(
    Consumer,
    null,
    function (_ref9) {
      var refs = _ref9.refs,
          state = _ref9.state,
          setState = _ref9.setState;
      return state.isOpen && _react2.default.createElement(
        _portal2.default,
        null,
        _react2.default.createElement(
          _windowSize2.default,
          null,
          function () {
            return _react2.default.createElement(
              _rect2.default,
              null,
              function (_ref10) {
                var menuRect = _ref10.rect,
                    menuRef = _ref10.ref;
                return _react2.default.createElement(
                  "div",
                  {
                    "data-reach-menu": true,
                    ref: menuRef,
                    style: getStyles(state.buttonRect, menuRect)
                  },
                  _react2.default.createElement(MenuListImpl, _extends({}, props, {
                    setState: setState,
                    state: state,
                    refs: refs
                  }))
                );
              }
            );
          }
        )
      );
    }
  );
};

process.env.NODE_ENV !== "production" ? MenuList.propTypes = {
  children: _propTypes.node
} : void 0;

var MenuListImpl = _react2.default.forwardRef(function (_ref11, _ref12) {
  var refs = _ref11.refs,
      state = _ref11.state,
      setState = _ref11.setState,
      children = _ref11.children,
      onKeyDown = _ref11.onKeyDown,
      onBlur = _ref11.onBlur,
      rest = _objectWithoutProperties(_ref11, ["refs", "state", "setState", "children", "onKeyDown", "onBlur"]);

  return _react2.default.createElement(
    "div",
    _extends({
      "data-reach-menu-list": true
    }, rest, {
      role: "menu",
      id: state.menuId,
      "aria-labelledby": state.buttonId,
      tabIndex: "-1",
      ref: function ref(node) {
        refs.menu = node;
        _ref12 && _ref12(node);
      },
      onBlur: function onBlur(event) {
        if (!state.closingWithClick && !refs.menu.contains(event.relatedTarget)) {
          setState(close);
        }
      },
      onKeyDown: wrapEvent(onKeyDown, function (event) {
        if (event.key === "Escape") {
          setState(close);
        } else if (event.key === "ArrowDown") {
          event.preventDefault(); // prevent window scroll
          var nextIndex = state.selectionIndex + 1;
          if (nextIndex !== _react2.default.Children.count(children)) {
            setState({ selectionIndex: nextIndex });
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault(); // prevent window scroll
          var _nextIndex = state.selectionIndex - 1;
          if (_nextIndex !== -1) {
            setState({ selectionIndex: _nextIndex });
          }
        } else if (event.key === "Tab") {
          event.preventDefault(); // prevent leaving
        }
      })
    }),
    _react2.default.Children.map(children, function (child, index) {
      if (child.type === MenuItem || child.type === MenuLink) {
        return _react2.default.cloneElement(child, {
          setState: setState,
          state: state,
          index: index,
          _ref: function _ref(node) {
            return refs.items[index] = node;
          }
        });
      } else {
        return child;
      }
    })
  );
});

////////////////////////////////////////////////////////////////////////
var MenuItem = _react2.default.forwardRef(function (_ref13, _ref14) {
  var onSelect = _ref13.onSelect,
      onClick = _ref13.onClick,
      _ref13$role = _ref13.role,
      role = _ref13$role === undefined ? "menuitem" : _ref13$role,
      state = _ref13.state,
      setState = _ref13.setState,
      index = _ref13.index,
      onKeyDown = _ref13.onKeyDown,
      onMouseMove = _ref13.onMouseMove,
      _ref = _ref13._ref,
      rest = _objectWithoutProperties(_ref13, ["onSelect", "onClick", "role", "state", "setState", "index", "onKeyDown", "onMouseMove", "_ref"]);

  var isSelected = index === state.selectionIndex;
  var select = function select() {
    onSelect();
    setState(close);
  };
  return _react2.default.createElement("div", _extends({}, rest, {
    ref: function ref(node) {
      _ref14 && _ref14(node);
      _ref(node);
    },
    "data-reach-menu-item": role === "menuitem" ? true : undefined,
    role: role,
    tabIndex: "-1",
    "data-selected": role === "menuitem" && isSelected ? true : undefined,
    onClick: wrapEvent(onClick, function (event) {
      select();
    }),
    onKeyDown: wrapEvent(onKeyDown, function (event) {
      if (event.key === "Enter") {
        // prevent the button from being "clicked" by
        // this "Enter" keydown
        event.preventDefault();
        select();
      }
    }),
    onMouseMove: wrapEvent(onMouseMove, function (event) {
      if (!isSelected) {
        setState(selectItemAtIndex(index));
      }
    })
  }));
});

process.env.NODE_ENV !== "production" ? MenuItem.propTypes = {
  onSelect: _propTypes.func
} : void 0;

var k = function k() {};

////////////////////////////////////////////////////////////////////////
var MenuLink = _react2.default.forwardRef(function (_ref15, _ref16) {
  var onKeyDown = _ref15.onKeyDown,
      onClick = _ref15.onClick,
      _ref15$component = _ref15.component,
      Comp = _ref15$component === undefined ? _router.Link : _ref15$component,
      style = _ref15.style,
      setState = _ref15.setState,
      state = _ref15.state,
      index = _ref15.index,
      _ref = _ref15._ref,
      props = _objectWithoutProperties(_ref15, ["onKeyDown", "onClick", "component", "style", "setState", "state", "index", "_ref"]);

  return _react2.default.createElement(
    MenuItem,
    {
      role: "none",
      state: state,
      setState: setState,
      index: index,
      onSelect: k,
      _ref: k
    },
    _react2.default.createElement(Comp, _extends({
      role: "menuitem",
      "data-reach-menu-item": true,
      tabIndex: "-1",
      "data-selected": index === state.selectionIndex ? true : undefined,
      onClick: wrapEvent(onClick, function (event) {
        setState(close);
      }),
      onKeyDown: wrapEvent(onKeyDown, function (event) {
        if (event.key === "Enter") {
          // prevent MenuItem's preventDefault from firing,
          // allowing this link to work w/ the keyboard
          event.stopPropagation();
        }
      }),
      ref: function ref(node) {
        _ref(node);
        _ref16 && _ref16(node);
      },
      style: _extends({}, style)
    }, props))
  );
});

// TODO: Deal with collisions on the bottom, though not as important
// since focus causes a scroll and will then scroll the page down
// to the item.
var getStyles = function getStyles(buttonRect, menuRect) {
  var haventMeasuredButtonYet = !buttonRect;
  if (haventMeasuredButtonYet) {
    return { opacity: 0 };
  }

  var haventMeasuredMenuYet = !menuRect;

  var styles = {
    left: buttonRect.left + window.scrollX + "px",
    top: buttonRect.top + buttonRect.height + window.scrollY + "px"
  };

  if (haventMeasuredMenuYet) {
    return _extends({}, styles, {
      opacity: 0
    });
  }

  if (buttonRect.width < 500) {
    styles.minWidth = buttonRect.width;
  }

  var collisionRight = window.innerWidth < buttonRect.left + menuRect.width;
  // let collisionBottom = window.innerHeight < buttonRect.top + menuRect.height;

  if (collisionRight) {
    return _extends({}, styles, {
      left: buttonRect.right - menuRect.width + window.scrollX + "px",
      top: buttonRect.top + buttonRect.height + window.scrollY + "px"
    });
    // } else if (collisionBottom) {
  } else {
    return styles;
  }
};

exports.Menu = Menu;
exports.MenuList = MenuList;
exports.MenuButton = MenuButton;
exports.MenuLink = MenuLink;
exports.MenuItem = MenuItem;