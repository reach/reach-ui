import tabsChart from "./chart";

export const tabs = {
  chart: tabsChart,
  type: "ROOT_COMPONENT",
  refs: {
    tabs: []
  },
  tagName: "div",
  attrs: {
    "data-reach-tabs": ""
  }
};

export const tablist = {
  type: "INDEXED_PARENT",
  tagName: "div",
  events: {
    onKeyDown: switchKey({
      ArrowRight: "ARROW_RIGHT",
      ArrowLeft: "ARROW_LEFT",
      Home: "HOME",
      End: "End"
    })
  },
  attrs: {
    role: "tablist",
    "data-reach-tab-list": ""
  }
};

export const tab = {
  type: "INDEXED_CHILD",
  tagName: "button",
  attrs: {
    "data-reach-tab": "",
    role: "tab",
    type: "button",
    id: (state, ctx, rootId, index) => `${rootId}--tab-${index}`,
    tabIndex: (state, ctx, rootId, index) => (ctx.index === index ? "0" : "-1"),
    "aria-selected": (s, ctx, rootId, index) => ctx.index === index,
    "aria-controls": (s, ctx, rootId, index) => `${rootId}--panel-${index}`,
    "data-selected": (s, ctx, rootId, index) =>
      ctx.index === index ? "" : undefined
  }
};

export const tabpanels = {
  type: "INDEXED_PARENT",
  tagName: "div",
  attrs: {
    "data-reach-tab-panels": ""
  }
};

// need to make registering optional
export const tabpanel = {
  type: "INDEXED_CHILD",
  tagName: "div",
  attrs: (state, ctx, rootId, index) => {
    const isActive = ctx.index === index;
    return {
      role: "tabpanel",
      hidden: !isActive,
      tabIndex: isActive ? "0" : "-1",
      "data-reach-tab-panel": "",
      "aria-labelledby": `${rootId}--tab-${index}`
    };
  }
};

////////////////////////////////////////////////////////////////////////////////
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
