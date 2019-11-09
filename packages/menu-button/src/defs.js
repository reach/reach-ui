import menuButtonChart from "./chart";

// TODO: get rid of <MachineProvider>, do it all inside
// createRootComponent
export const container = {
  type: "ROOT_PROVIDER",
  displayName: "MenuButtonContainer",
  chart: menuButtonChart,
  refs: {
    button: null,
    menu: null,
    items: []
  },
  setup: send => {
    let up = () => send("DOC_POINTER_UP");
    document.addEventListener("pointerup", up);
    return () => document.removeEventListener("pointerup", up);
  }
};

export const button = {
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
    id: (state, ctx, rootId) => `${rootId}--button`,
    "aria-haspopup": "menu",
    "aria-expanded": state => {
      return state.startsWith("open");
    },
    "aria-controls": (state, ctx, rootId) => {
      // TODO: put rootId in ctx
      return `${rootId}--menu`;
    },
    "data-reach-menu-button": ""
  }
};

export const popover = {
  type: "POPOVER",
  displayName: "MenuPopover",
  targetRef: "button",
  attrs: {
    "data-reach-menu-popover": ""
  }
};

export const menu = {
  type: "INDEXED_PARENT",
  displayName: "Menu",
  tagName: "div",
  ref: "menu",
  descendants: "items",
  attrs: {
    role: "menu",
    id: (state, ctx, rootId) => `${rootId}--menu`,
    tabIndex: "-1",
    "aria-labelledby": (state, ctx, rootId) => `${rootId}--button`,
    "aria-activedescendant": (state, ctx, rootId) =>
      `${rootId}--menu-item-${ctx.activeIndex}`,
    "data-reach-menu": "",
    "data-closed": state => (!state.startsWith("open") ? "" : undefined)
  },
  events: {
    onKeyDown: switchKey({
      Tab: event => event.preventDefault(),
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
    onKeyPress: (event, send) => {
      // TODO: just send the event all the time?
      send({ type: "KEY_PRESS", key: event.key });
    }
  }
};

// YOU ARE HERE:
// Trying to figure out how to abstract these "descendants"
export const item = {
  type: "INDEXED_CHILD",
  tagName: "div",
  events: {
    onPointerDown: "ITEM_POINTER_DOWN",
    onPointerUp: "ITEM_POINTER_UP",
    onPointerEnter: (event, send, index) => {
      send({ type: "ITEM_POINTER_ENTER", index });
    },
    onPointerLeave: "ITEM_POINTER_LEAVE"
  },
  attrs: {
    role: "menuitem",
    id: (state, ctx, rootId, index) => `${rootId}--menu-item-${index}`,
    "data-reach-menu-item": "",
    "data-selected": (state, ctx, rootId, index) =>
      ctx.activeIndex === index ? "" : undefined,
    "data-confirming": (state, ctx, rootId, index) =>
      ctx.activeIndex === index && state === "open:confirming" ? "" : undefined
  }
};

function switchKey(keys) {
  return (event, send) => {
    const handler = keys[event.key];
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
  return (event, send) => {
    if (event.button === 0) {
      send(eventName);
    }
  };
}
