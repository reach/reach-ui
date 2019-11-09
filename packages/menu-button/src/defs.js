import menuButtonChart from "./chart";

// TODO: get rid of <MachineProvider>, do it all inside
// createRootComponent
export const container = {
  displayName: "MenuContainer",
  chart: menuButtonChart,
  refs: {
    button: null,
    menu: null,
    items: []
  }
};

export const button = {
  displayName: "MenuButton",
  tagName: "button",
  ref: "button",
  events: {
    onClick: "BUTTON_CLICK",
    onPointerDown: "BUTTON_POINTER_DOWN",
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
    "data-reach-menu-button": "",
    "aria-haspopup": "menu",
    "aria-expanded": state => {
      return state.startsWith("open");
    },
    "aria-controls": (state, ctx, rootId) => {
      // TODO: put rootId in ctx
      return `${rootId}--menu`;
    },
    id: (state, ctx, rootId) => {
      return `${rootId}--button`;
    }
  },
  setup: send => {
    // Can we do this in the state machine instead with enter/leave?
    // Maybe a provider "setup" function?
    // Maybe 1st class "doc" events if we need them?
    // The button is a weird place though...
    let up = () => send("DOC_POINTER_UP");
    document.addEventListener("pointerup", up);
    return () => document.removeEventListener("pointerup", up);
  }
};

export const popover = {
  type: "popover",
  displayName: "MenuPopover",
  targetRef: "button",
  attrs: {
    "data-reach-menu-popover": ""
  }
};

export const menu = {
  type: "indexed-parent",
  displayName: "Menu",
  tagName: "div",
  ref: "menu",
  descendants: "items",
  attrs: (state, ctx, rootId) => ({
    "data-reach-menu": "",
    "data-closed": !state.startsWith("open") ? "" : undefined,
    role: "menu",
    id: `${rootId}--menu`,
    tabIndex: "-1",
    "aria-labelledby": `${rootId}--button`,
    "aria-activedescendant": `${rootId}--menu-item-${ctx.activeIndex}`
  }),
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
  type: "indexed-child",
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
    "data-reach-menu-item": "",
    "data-selected": (state, ctx, rootId, index) =>
      ctx.activeIndex === index ? "" : undefined,
    "data-confirming": (state, ctx, rootId, index) =>
      ctx.activeIndex === index && state === "open:confirming" ? "" : undefined,
    role: "menuitem",
    id: (state, ctx, rootId, index) => `${rootId}--menu-item-${index}`
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
