"use strict";

exports.__esModule = true;
exports.useDescendants = useDescendants;
exports.DescendantProvider = DescendantProvider;
exports.useDescendant = useDescendant;

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  if (obj != null) {
    var hasPropertyDescriptor =
      Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor
          ? Object.getOwnPropertyDescriptor(obj, key)
          : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
  }
  newObj["default"] = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

////////////////////////////////////////////////////////////////////////////////
// SUPER HACKS AHEAD: The React team will hate this enough to hopefully give us
// a way to know the index of a descendant given a parent (will help generate
// IDs for accessibility a long with the ability create maximally composable
// component abstractions).
//
// This is all to avoid cloneElement. If we can avoid cloneElement then people
// can have arbitrary markup around MenuItems.  This basically takes advantage
// of react's render lifecycles to let us "register" descendants to an
// ancestor, so that we can track all the descendants and manage focus on them,
// etc.  The super hacks here are for the child to know it's index as well, so
// that it can set attributes, match against state from above, etc.
var DescendantContext = (0, _react.createContext)();

function useDescendants() {
  return (0, _react.useRef)([]);
}

function DescendantProvider(_ref) {
  var items = _ref.items,
    props = _objectWithoutPropertiesLoose(_ref, ["items"]);

  // On the first render we say we're "assigning", and the children will push
  // into the array when they show up in their own useLayoutEffect.
  var assigning = (0, _react.useRef)(true); // since children are pushed into the array in useLayoutEffect of the child,
  // children can't read their index on first render.  So we need to cause a
  // second render so they can read their index.

  var _useState = (0, _react.useState)(),
    forceUpdate = _useState[1];

  var updating = (0, _react.useRef)(); // parent useLayoutEffect is always last

  (0, _react.useLayoutEffect)(function() {
    if (assigning.current) {
      // At this point all of the children have pushed into the array so we set
      // assigning to false and force an update. Since we're in
      // useLayoutEffect, we won't get a flash of rendered content, it will all
      // happen synchronously. And now that this is false, children won't push
      // into the array on the forceUpdate
      assigning.current = false;
      forceUpdate({});
    } else {
      // After the forceUpdate completes, we end up here and set assigning back
      // to true for the next update from the app
      assigning.current = true;
    }

    return function() {
      // this cleanup function runs right before the next render, so it's the
      // right time to empty out the array to be reassigned with whatever shows
      // up next render.
      if (assigning.current) {
        // we only want to empty out the array before the next render cycle if
        // it was NOT the result of our forceUpdate, so being guarded behind
        // assigning.current works
        items.current = [];
      }
    };
  });
  return _react["default"].createElement(
    DescendantContext.Provider,
    _extends({}, props, {
      value: {
        items: items,
        assigning: assigning
      }
    })
  );
}

function useDescendant(descendant) {
  var _useContext = (0, _react.useContext)(DescendantContext),
    assigning = _useContext.assigning,
    items = _useContext.items;

  var index = (0, _react.useRef)(-1);
  (0, _react.useLayoutEffect)(function() {
    if (assigning.current) {
      index.current = items.current.push(descendant) - 1;
    }
  }); // first render its wrong, after a forceUpdate in parent useLayoutEffect it's
  // right, and its all synchronous so we don't get any flashing

  return index.current;
}
