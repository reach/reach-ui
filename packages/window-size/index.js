"use strict";

exports.__esModule = true;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _componentComponent = require("@reach/component-component");

var _componentComponent2 = _interopRequireDefault(_componentComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasWindow = typeof window !== "undefined";

var didMount = function didMount(_ref) {
  var refs = _ref.refs,
      setState = _ref.setState;

  var resize = function resize() {
    return setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  window.addEventListener("resize", resize);
  refs.removeEvent = function () {
    window.addEventListener("resize", resize);
  };
};

var willUnmount = function willUnmount(_ref2) {
  var refs = _ref2.refs;

  refs.removeEvent();
};

var WindowSize = function WindowSize(_ref3) {
  var children = _ref3.children;
  return _react2.default.createElement(_componentComponent2.default, {
    refs: { removeEvent: null },
    initialState: {
      width: hasWindow && window.innerWidth,
      height: hasWindow && window.innerHeight
    },
    didMount: didMount,
    willUnmount: willUnmount,
    render: function render(_ref4) {
      var state = _ref4.state;
      return children(state);
    }
  });
};

exports.default = WindowSize;