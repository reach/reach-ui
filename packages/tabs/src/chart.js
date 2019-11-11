import { Machine as createMachine, assign } from "xstate";

export const chart = {
  id: "tabs",
  initial: "idle",
  context: {
    index: 0,
    panelTabbable: false
  },
  states: {
    idle: {
      entry: ["setPanelTabbable"],
      on: {
        TAB_CLICK: {
          target: "idle",
          actions: ["setIndex"]
        },
        ARROW_RIGHT: {
          target: "idle",
          actions: ["setNext", "focusTab"]
        },
        ARROW_LEFT: {
          target: "idle",
          actions: ["setPrev", "focusTab"]
        },
        HOME: {
          target: "idle",
          actions: ["setFirst", "focusTab"]
        },
        END: {
          target: "idle",
          actions: ["setLast", "focusTab"]
        }
      }
    }
  }
};

export const actions = {
  setIndex: () => {},
  setFirst: () => {},
  setLast: () => {},
  setPrev: () => {},
  setNext: () => {},
  focusTab: () => {}
};

export const guards = {};

export default createMachine(chart, { actions, guards });
