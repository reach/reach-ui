import { Machine as createMachine, assign } from "xstate";

const openEvents = {
  KEY_ESCAPE: {
    target: "idle",
    actions: ["focusButton"]
  },
  KEY_ARROW_UP: {
    target: "open:selecting",
    actions: ["navigatePrev"]
  },
  KEY_ARROW_DOWN: {
    target: "open:selecting",
    actions: ["navigateNext"]
  },
  BLUR: {
    target: "idle",
    cond: "clickedNonMenuItem"
  },
  ITEM_POINTER_ENTER: {
    target: "open:selecting",
    actions: ["highlightItem"]
  },
  ITEM_POINTER_LEAVE: {
    target: "open:selecting",
    actions: ["resetIndex"]
  },
  ITEM_POINTER_DOWN: "open:clickingItem",
  KEY_ENTER: {
    target: "open:confirming",
    cond: "hasHighlight"
  },
  KEY_SPACE: {
    target: "open:confirming",
    cond: "hasHighlight"
  },
  HOME: {
    target: "open:selecting",
    actions: ["highlightFirst"]
  },
  END: {
    target: "open:selecting",
    actions: ["highlightLast"]
  }
};

const chart = {
  id: "menu-button",

  context: {
    searchStartIndex: -1,
    search: "",
    activeIndex: -1,

    // barf
    button: null,
    items: null
  },

  initial: "idle",

  states: {
    "open:confirming": {
      entry: ["assignRefsForClose"],
      after: {
        200: {
          target: "idle",
          actions: ["focusButton", "selectItem"]
        }
      }
    },
    idle: {
      on: {
        // BUTTON_CLICK: {
        //   target: "open:selecting",
        //   actions: ["resetIndex"]
        // },
        BUTTON_POINTER_DOWN: {
          target: "open:clickingButton",
          actions: ["resetIndex"]
        },
        KEYDOWN_SPACE: {
          target: "open:selecting",
          actions: ["resetIndex", "focusMenu"]
        },
        KEYDOWN_ENTER: {
          target: "open:selecting",
          actions: ["resetIndex", "focusMenu"]
        },
        ARROW_DOWN: {
          target: "open:selecting",
          actions: ["highlightFirst"]
        },
        ARROW_UP: {
          target: "open:selecting",
          actions: ["highlightLast"]
        }
      }
    },
    "open:selecting": {
      entry: ["disableTooltips", "focusMenu"],
      exit: ["enableTooltips"],
      on: {
        ...openEvents,
        KEY_PRESS: {
          target: "open:searching",
          actions: [
            // "resetSearch"
            "concatSearch",
            "setSearchStartIndex"
          ]
        }
      }
    },
    "open:selectingWithDrag": {
      entry: ["disableTooltips"],
      exit: ["enableTooltips"],
      on: {
        ...openEvents,
        ITEM_POINTER_UP: {
          target: "open:confirming"
        },
        DOC_POINTER_UP: {
          target: "idle",
          actions: ["focusButton"]
        },
        BUTTON_POINTER_UP: {
          // blocks DOC_POINTER_UP
          target: "idle",
          actions: ["focusButton"]
        },
        ITEM_POINTER_ENTER: {
          target: "open:selectingWithDrag",
          actions: ["highlightItem"]
        },
        ITEM_POINTER_LEAVE: {
          target: "open:selectingWithDrag",
          actions: ["resetIndex"]
        }
      }
    },
    // TODO THIS IS ALL BUSTED
    "open:searching": {
      entry: ["highlightSearchMatch"],
      exit: ["resetSearchStartIndex"],
      after: {
        1000: {
          target: "open:selecting",
          actions: ["resetSearch"]
        }
      },
      on: {
        ...openEvents,
        KEY_PRESS: {
          target: "open:searching",
          actions: ["concatSearch"]
        }
      }
    },
    "open:clickingButton": {
      after: {
        500: "open:selectingWithDrag"
      },
      on: {
        BUTTON_POINTER_UP: "open:selecting",
        BUTTON_POINTER_LEAVE: "open:selectingWithDrag"
      }
    },
    "open:clickingItem": {
      after: {
        500: "open:selectingWithDrag"
      },
      on: {
        ITEM_POINTER_LEAVE: "open:selectingWithDrag",
        ITEM_POINTER_UP: {
          target: "open:confirming"
        }
      }
    }
  }
};

const actions = {
  focusButton: (ctx, event) => {
    ((event.refs && event.refs.button) || ctx.button).focus();
  },
  focusMenu: (ctx, event) => {
    // need to let the keydown event finish before moving focus
    requestAnimationFrame(() => {
      event.refs.menu.focus();
    });
  },

  // index stuff
  highlightFirst: assign({ activeIndex: 0 }),
  highlightLast: assign({ activeIndex: ctx => ctx.items().length - 1 }),
  highlightItem: assign({ activeIndex: (ctx, event) => event.index }),
  navigateNext: assign({
    activeIndex: (ctx, event) => {
      const { items } = event.refs;
      console.log(items);
      return (ctx.activeIndex + 1) % items.length;
    }
  }),
  navigatePrev: assign({
    activeIndex: (ctx, event) => {
      const { items } = event.refs;
      return (ctx.activeIndex + items.length - 1) % items.length;
    }
  }),

  resetIndex: assign({ activeIndex: -1 }),

  // tooltips
  disableTooltips: () => {
    window.__REACH_DISABLE_TOOLTIPS = false;
  },

  enableTooltips: () => {
    window.__REACH_DISABLE_TOOLTIPS = true;
  },

  // Search
  resetSearch: assign({ search: "" }),

  concatSearch: assign({
    search: (ctx, event) => ctx.search + event.key
  }),

  setSearchStartIndex: assign({ searchStartIndex: ctx => ctx.activeIndex }),

  resetSearchStartIndex: assign({ searchStartIndex: -1 }),

  highlightSearchMatch: assign({
    activeIndex: (ctx, event) => {
      const { searchStartIndex, search } = ctx;
      const searchString = search.toLowerCase();
      const { items } = event.refs;
      const reordered = items
        .slice(searchStartIndex + 1)
        .concat(items.slice(0, searchStartIndex));

      for (let i = 0, l = reordered.length; i < l; i++) {
        const itemText = reordered[i].searchText.toLowerCase();
        if (itemText.startsWith(searchString)) {
          // adjust the index back since we rearranged them
          // there is a math way to do this like:
          // return searchStartIndex + 1 + i % items.length;
          // but it's too late right now
          return items.findIndex(item => item === reordered[i]);
        }
      }
      return -1;
    }
  }),

  selectItem: (ctx, event) => {
    const { items } = ctx;
    items[ctx.activeIndex].onSelect();
  },

  assignRefsForClose: assign({
    button: (ctx, event) => event.refs.button,
    items: (ctx, event) => event.refs.items
  })
};

const guards = {
  hasHighlight: ctx => ctx.activeIndex > -1,
  clickedNonMenuItem: (ctx, event) =>
    !event.refs.menu.contains(event.relatedTarget)
};

if (__DEV__) {
  validate(chart, actions, guards);
}

function validate(chart, actions, guards) {
  let usedActions = {};
  let usedGuards = {};

  for (let state in chart.states) {
    let eventActions = [];
    let entry = chart.states[state].entry;
    let exit = chart.states[state].exit;
    if (entry) eventActions.push(...entry);
    if (exit) eventActions.push(...exit);
    let events = {
      ...chart.states[state].on,
      ...chart.states[state].after
    };
    for (let event in events) {
      if (events[event].actions) {
        eventActions.push(...events[event].actions);
      }
      const guard = events[event].cond;
      if (guard) {
        usedGuards[guard] = true;
        if (!guards[guard]) {
          console.warn(
            `Guard not found: "${guard}" for ${chart.id} "${state}"`
          );
        }
      }
    }
    for (let action of eventActions) {
      usedActions[action] = true;
      if (!actions[action]) {
        console.warn(
          `Action not found: "${action}" for ${chart.id} "${state}"`
        );
      }
    }
  }

  for (let action in actions) {
    if (!usedActions[action]) {
      console.warn(`Defined action "${action}" is not used in the chart.`);
    }
  }

  // for (let guard in guards) {
  //   if (!usedGuards[guard]) {
  //     console.warn(`Defined guard "${guard}" is not used in the chart.`);
  //   }
  // }
}

export default createMachine(chart, { actions, guards });
