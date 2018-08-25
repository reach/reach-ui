"use strict";

exports.__esModule = true;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _componentComponent = require("@reach/component-component");

var _componentComponent2 = _interopRequireDefault(_componentComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Portal = function Portal(_ref) {
  var children = _ref.children,
      _ref$type = _ref.type,
      type = _ref$type === undefined ? "reach-portal" : _ref$type;
  return _react2.default.createElement(_componentComponent2.default, {
    getRefs: function getRefs() {
      return { node: null };
    },
    didMount: function didMount(_ref2) {
      var refs = _ref2.refs,
          forceUpdate = _ref2.forceUpdate;

      refs.node = document.createElement(type);
      document.body.appendChild(refs.node);
      forceUpdate();
    },
    willUnmount: function willUnmount(_ref3) {
      var node = _ref3.refs.node;

      document.body.removeChild(node);
    },
    render: function render(_ref4) {
      var node = _ref4.refs.node;

      return node ? (0, _reactDom.createPortal)(children, node) : null;
    }
  });
};

exports.default = Portal;