"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _xstate = require("xstate");

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

var openEvents = {
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
var chart = {
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
      on: _extends({}, openEvents, {
        KEY_PRESS: {
          target: "open:searching",
          actions: [
            // "resetSearch"
            "concatSearch",
            "setSearchStartIndex"
          ]
        }
      })
    },
    "open:selectingWithDrag": {
      entry: ["disableTooltips"],
      exit: ["enableTooltips"],
      on: _extends({}, openEvents, {
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
      })
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
      on: _extends({}, openEvents, {
        KEY_PRESS: {
          target: "open:searching",
          actions: ["concatSearch"]
        }
      })
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
var actions = {
  focusButton: function focusButton(ctx, event) {
    ((event.refs && event.refs.button) || ctx.button).focus();
  },
  focusMenu: function focusMenu(ctx, event) {
    // need to let the keydown event finish before moving focus
    requestAnimationFrame(function() {
      event.refs.menu.focus();
    });
  },
  // index stuff
  highlightFirst: (0, _xstate.assign)({
    activeIndex: 0
  }),
  highlightLast: (0, _xstate.assign)({
    activeIndex: function activeIndex(ctx) {
      return ctx.items().length - 1;
    }
  }),
  highlightItem: (0, _xstate.assign)({
    activeIndex: function activeIndex(ctx, event) {
      return event.index;
    }
  }),
  navigateNext: (0, _xstate.assign)({
    activeIndex: function activeIndex(ctx, event) {
      var items = event.refs.items;
      console.log(items);
      return (ctx.activeIndex + 1) % items.length;
    }
  }),
  navigatePrev: (0, _xstate.assign)({
    activeIndex: function activeIndex(ctx, event) {
      var items = event.refs.items;
      return (ctx.activeIndex + items.length - 1) % items.length;
    }
  }),
  resetIndex: (0, _xstate.assign)({
    activeIndex: -1
  }),
  // tooltips
  disableTooltips: function disableTooltips() {
    window.__REACH_DISABLE_TOOLTIPS = false;
  },
  enableTooltips: function enableTooltips() {
    window.__REACH_DISABLE_TOOLTIPS = true;
  },
  // Search
  resetSearch: (0, _xstate.assign)({
    search: ""
  }),
  concatSearch: (0, _xstate.assign)({
    search: function search(ctx, event) {
      return ctx.search + event.key;
    }
  }),
  setSearchStartIndex: (0, _xstate.assign)({
    searchStartIndex: function searchStartIndex(ctx) {
      return ctx.activeIndex;
    }
  }),
  resetSearchStartIndex: (0, _xstate.assign)({
    searchStartIndex: -1
  }),
  highlightSearchMatch: (0, _xstate.assign)({
    activeIndex: function activeIndex(ctx, event) {
      var searchStartIndex = ctx.searchStartIndex,
        search = ctx.search;
      var searchString = search.toLowerCase();
      var items = event.refs.items;
      var reordered = items
        .slice(searchStartIndex + 1)
        .concat(items.slice(0, searchStartIndex));

      var _loop = function _loop(i, l) {
        var itemText = reordered[i].searchText.toLowerCase();

        if (itemText.startsWith(searchString)) {
          // adjust the index back since we rearranged them
          // there is a math way to do this like:
          // return searchStartIndex + 1 + i % items.length;
          // but it's too late right now
          return {
            v: items.findIndex(function(item) {
              return item === reordered[i];
            })
          };
        }
      };

      for (var i = 0, l = reordered.length; i < l; i++) {
        var _ret = _loop(i, l);

        if (typeof _ret === "object") return _ret.v;
      }

      return -1;
    }
  }),
  selectItem: function selectItem(ctx, event) {
    var items = ctx.items;
    items[ctx.activeIndex].onSelect();
  },
  assignRefsForClose: (0, _xstate.assign)({
    button: function button(ctx, event) {
      return event.refs.button;
    },
    items: function items(ctx, event) {
      return event.refs.items;
    }
  })
};
var guards = {
  hasHighlight: function hasHighlight(ctx) {
    return ctx.activeIndex > -1;
  },
  clickedNonMenuItem: function clickedNonMenuItem(ctx, event) {
    return !event.refs.menu.contains(event.relatedTarget);
  }
};

if (process.env.NODE_ENV !== "production") {
  validate(chart, actions, guards);
}

function validate(chart, actions, guards) {
  var usedActions = {};
  var usedGuards = {};

  for (var state in chart.states) {
    var eventActions = [];
    var entry = chart.states[state].entry;
    var exit = chart.states[state].exit;
    if (entry) eventActions.push.apply(eventActions, entry);
    if (exit) eventActions.push.apply(eventActions, exit);

    var events = _extends(
      {},
      chart.states[state].on,
      {},
      chart.states[state].after
    );

    for (var event in events) {
      if (events[event].actions) {
        eventActions.push.apply(eventActions, events[event].actions);
      }

      var guard = events[event].cond;

      if (guard) {
        usedGuards[guard] = true;

        if (!guards[guard]) {
          console.warn(
            'Guard not found: "' +
              guard +
              '" for ' +
              chart.id +
              ' "' +
              state +
              '"'
          );
        }
      }
    }

    for (
      var _i = 0, _eventActions = eventActions;
      _i < _eventActions.length;
      _i++
    ) {
      var action = _eventActions[_i];
      usedActions[action] = true;

      if (!actions[action]) {
        console.warn(
          'Action not found: "' +
            action +
            '" for ' +
            chart.id +
            ' "' +
            state +
            '"'
        );
      }
    }
  }

  for (var _action in actions) {
    if (!usedActions[_action]) {
      console.warn(
        'Defined action "' + _action + '" is not used in the chart.'
      );
    }
  } // for (let guard in guards) {
  //   if (!usedGuards[guard]) {
  //     console.warn(`Defined guard "${guard}" is not used in the chart.`);
  //   }
  // }
}

var _default = (0, _xstate.Machine)(chart, {
  actions: actions,
  guards: guards
});

exports["default"] = _default;
