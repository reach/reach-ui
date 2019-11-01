import { Machine as createMachine, assign } from "xstate";
console.clear();

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
    target: "open:confirming:highlighted",
    cond: "hasHighlight"
  },
  KEY_SPACE: {
    target: "open:confirming:highlighted",
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
    index: 0,
    button: null,
    menu: null,
    items: [],
    search: "",
    activeIndex: -1
  },

  initial: "unmounted",

  states: {
    unmounted: {
      on: {
        UPDATE: {
          target: "idle",
          actions: ["bridgeView"]
        }
      }
    },
    "open:confirming:highlighted": {
      after: {
        50: "open:confirming:unhighlighted"
      }
    },
    "open:confirming:unhighlighted": {
      after: {
        50: "open:confirming:final"
      }
    },
    "open:confirming:final": {
      after: {
        100: {
          target: "idle",
          actions: ["focusButton", "selectItem"]
        }
      }
    },
    idle: {
      on: {
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
        },
        UPDATE: {
          target: "idle",
          actions: ["bridgeView"]
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
        },
        UPDATE: {
          target: "open:selecting",
          actions: ["bridgeView"]
        }
      }
    },
    "open:selectingWithDrag": {
      entry: ["disableTooltips"],
      exit: ["enableTooltips"],
      on: {
        ...openEvents,
        DOC_POINTER_UP: [
          {
            target: "open:confirming:highlighted",
            cond: "hasHighlight"
          },
          {
            target: "idle",
            actions: ["focusButton"]
          }
        ],
        ITEM_POINTER_ENTER: {
          target: "open:selectingWithDrag",
          actions: ["highlightItem"]
        },
        ITEM_POINTER_LEAVE: {
          target: "open:selectingWithDrag",
          actions: ["resetIndex"]
        },
        UPDATE: {
          target: "open:selectingWithDrag",
          actions: ["bridgeView"]
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
          target: "open:confirming:highlighted"
        }
      }
    }
  }
};

const actions = {
  bridgeView: assign({
    button: (c, event) => event.button,
    menu: (c, event) => event.menu,
    items: (c, event) => event.items,
    onSelectHandlers: (c, event) => event.onSelectHandlers
  }),

  highlightFirst: assign({
    activeIndex: 0
  }),

  highlightLast: assign({
    activeIndex: ctx => ctx.items.length - 1
  }),

  selectItem: (ctx, event) => {
    const item = ctx.items[ctx.activeIndex];
    item.onSelect();
  },

  highlightItem: assign({
    activeIndex: (ctx, event) => event.index
  }),

  navigateNext: assign({
    activeIndex: ctx => (ctx.activeIndex + 1) % ctx.items.length
  }),

  navigatePrev: assign({
    activeIndex: ctx =>
      (ctx.activeIndex + ctx.items.length - 1) % ctx.items.length
  }),

  resetIndex: assign({
    activeIndex: -1
  }),

  disableTooltips: () => {
    window.__REACH_DISABLE_TOOLTIPS = false;
  },

  enableTooltips: () => {
    window.__REACH_DISABLE_TOOLTIPS = true;
  },

  resetSearch: assign({
    search: ""
  }),

  concatSearch: assign({
    search: (ctx, event) => {
      return ctx.search + event.key;
    }
  }),

  focusButton: ctx => {
    ctx.button.focus();
  },

  focusMenu: ctx => {
    // need to let the keydown event finish? But why?
    setTimeout(() => {
      ctx.menu.focus();
    }, 200);
  },

  setSearchStartIndex: assign({
    searchStartIndex: ctx => ctx.activeIndex
  }),

  resetSearchStartIndex: assign({
    searchStartIndex: -1
  }),

  highlightSearchMatch: assign({
    activeIndex: ({ items, searchStartIndex, search }, event) => {
      // start from the current index, so we rearrange the array first
      const reordered = items
        .slice(searchStartIndex + 1)
        .concat(items.slice(0, searchStartIndex));
      const searchString = search.toLowerCase();

      for (let i = 0, l = reordered.length; i < l; i++) {
        const itemText = reordered[i].innerText.toLowerCase();
        if (itemText.startsWith(searchString)) {
          // adjust the index back since we rearranged them
          // there is a math way to do this but it's too late right now
          // return searchStartIndex + 1 + i;
          return items.findIndex(item => item === reordered[i]);
        }
      }
      return -1;
    }
  })
};

const guards = {
  hasHighlight: ctx => ctx.activeIndex > -1,
  clickedNonMenuItem: (ctx, event) => !ctx.menu.contains(event.relatedTarget)
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
