"use strict";

exports.__esModule = true;
exports.item = exports.menu = exports.popover = exports.button = exports.container = void 0;

var _chart = _interopRequireDefault(require("./chart"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var container = {
  type: "ROOT_PROVIDER",
  displayName: "MenuButtonContainer",
  chart: _chart["default"],
  refs: {
    button: null,
    menu: null,
    items: []
  },
  setup: function setup(send) {
    var up = function up() {
      return send("DOC_POINTER_UP");
    };

    document.addEventListener("pointerup", up);
    return function() {
      return document.removeEventListener("pointerup", up);
    };
  }
};
exports.container = container;
var button = {
  displayName: "MenuButton",
  tagName: "button",
  ref: "button",
  events: {
    onClick: "BUTTON_CLICK",
    onPointerDown: leftClick("BUTTON_POINTER_DOWN"),
    onPointerUp: "BUTTON_POINTER_UP",
    onPointerMove: "BUTTON_POINTER_MOVE",
    onPointerLeave: "BUTTON_POINTER_LEAVE",
    onKeyDown: switchKey({
      " ": "KEYDOWN_SPACE",
      Enter: "KEYDOWN_ENTER",
      ArrowDown: "ARROW_DOWN",
      ArrowUp: "ARROW_UP"
    })
  },
  attrs: {
    type: "button",
    id: function id(state, ctx, rootId) {
      return rootId + "--button";
    },
    "aria-haspopup": "menu",
    "aria-expanded": function ariaExpanded(state) {
      return state.startsWith("open");
    },
    "aria-controls": function ariaControls(state, ctx, rootId) {
      // TODO: put rootId in ctx
      return rootId + "--menu";
    },
    "data-reach-menu-button": ""
  }
};
exports.button = button;
var popover = {
  type: "POPOVER",
  displayName: "MenuPopover",
  targetRef: "button",
  attrs: {
    "data-reach-menu-popover": ""
  }
};
exports.popover = popover;
var menu = {
  type: "INDEXED_PARENT",
  displayName: "Menu",
  tagName: "div",
  ref: "menu",
  descendants: "items",
  attrs: {
    role: "menu",
    id: function id(state, ctx, rootId) {
      return rootId + "--menu";
    },
    tabIndex: "-1",
    "aria-labelledby": function ariaLabelledby(state, ctx, rootId) {
      return rootId + "--button";
    },
    "aria-activedescendant": function ariaActivedescendant(state, ctx, rootId) {
      return rootId + "--menu-item-" + ctx.activeIndex;
    },
    "data-reach-menu": "",
    "data-closed": function dataClosed(state) {
      return !state.startsWith("open") ? "" : undefined;
    }
  },
  events: {
    onKeyDown: switchKey({
      Tab: function Tab(event) {
        return event.preventDefault();
      },
      Escape: "KEY_ESCAPE",
      ArrowDown: "KEY_ARROW_DOWN",
      ArrowUp: "KEY_ARROW_UP",
      Enter: "KEY_ENTER",
      " ": "KEY_SPACE",
      Home: "HOME",
      End: "END"
    }),
    onBlur: "BLUR",
    onPointerLeave: "POINTER_LEAVE_MENU",
    onKeyPress: function onKeyPress(event, send) {
      // TODO: just send the event all the time?
      send({
        type: "KEY_PRESS",
        key: event.key
      });
    }
  }
}; // YOU ARE HERE:
// Trying to figure out how to abstract these "descendants"

exports.menu = menu;
var item = {
  type: "INDEXED_CHILD",
  tagName: "div",
  events: {
    onPointerDown: "ITEM_POINTER_DOWN",
    onPointerUp: "ITEM_POINTER_UP",
    onPointerEnter: function onPointerEnter(event, send, index) {
      send({
        type: "ITEM_POINTER_ENTER",
        index: index
      });
    },
    onPointerLeave: "ITEM_POINTER_LEAVE"
  },
  attrs: {
    role: "menuitem",
    id: function id(state, ctx, rootId, index) {
      return rootId + "--menu-item-" + index;
    },
    "data-reach-menu-item": "",
    "data-selected": function dataSelected(state, ctx, rootId, index) {
      return ctx.activeIndex === index ? "" : undefined;
    },
    "data-confirming": function dataConfirming(state, ctx, rootId, index) {
      return ctx.activeIndex === index && state === "open:confirming"
        ? ""
        : undefined;
    }
  }
};
exports.item = item;

function switchKey(keys) {
  return function(event, send) {
    var handler = keys[event.key];

    if (handler) {
      if (typeof handler === "function") {
        handler(event, send);
      } else {
        send(handler);
      }
    }
  };
}

function leftClick(eventName) {
  return function(event, send) {
    if (event.button === 0) {
      send(eventName);
    }
  };
}
