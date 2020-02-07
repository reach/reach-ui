import { useCallback, useEffect, useRef, useState } from "react";
import { DistributiveOmit, useConstant } from "@reach/utils";
import { assign, createMachine, interpret, StateMachine } from "@xstate/fsm";
import {
  ListboxEvent,
  ListboxNodeRefs,
  ListboxState,
  ListboxStateData,
  ListboxValue,
  MachineEventWithRefs,
  MachineToReactRefMap,
} from "./types";

////////////////////////////////////////////////////////////////////////////////
// States

export enum ListboxStates {
  // Resting/closed state.
  Idle = "IDLE",

  // The user is navigate the list with a pointer
  Navigating = "NAVIGATING",

  // The user is navigate the list with a keyboard
  NavigatingWithKeys = "NAVIGATING_WITH_KEYS",

  // The user is searching for an option with the keyboard
  Searching = "SEARCHING",

  // The user is interacting with arbitrary elements inside the popover
  Interacting = "INTERACTING",
}

////////////////////////////////////////////////////////////////////////////////
// Events

export enum ListboxEvents {
  ButtonPointerDown = "BUTTON_POINTER_DOWN",
  ButtonFinishClick = "BUTTON_FINISH_CLICK",
  Blur = "BLUR",
  ClearNavSelection = "CLEAR_NAV_SELECTION",
  ClearTypeaheadQuery = "CLEAR_TYPEAHEAD_QUERY",
  GetDerivedData = "GetDerivedData",
  KeyDownEscape = "KEY_DOWN_ESCAPE",
  KeyDownEnter = "KEY_DOWN_ENTER",
  KeyDownSpace = "KEY_DOWN_SPACE",
  KeyDownNavigate = "KEY_DOWN_NAVIGATE",
  KeyDownSearch = "KEY_DOWN_SEARCH",
  KeyDownTab = "KEY_DOWN_TAB",
  Navigate = "NAVIGATE",
  OptionMouseEnter = "OPTION_MOUSE_ENTER",

  // OptionSelect > User interacted with the list and selected something
  // ValueChange > Value change may have come from somewhere else (I.E., controlled button click)
  OptionSelect = "OPTION_SELECT",
  ValueChange = "VALUE_CHANGE",

  OptionStartClick = "OPTION_START_CLICK",
  OptionFinishClick = "OPTION_FINISH_CLICK",
  PopoverPointerDown = "POPOVER_POINTER_DOWN",
  PopoverPointerUp = "POPOVER_POINTER_UP",
}

////////////////////////////////////////////////////////////////////////////////
// Actions and conditions

let clearTypeaheadQuery = assign<ListboxStateData>({
  typeaheadQuery: null,
});

let assignValue = assign<ListboxStateData, any>({
  value: (_, event) => event.value,
});

let navigate = assign<ListboxStateData, any>(
  (data: ListboxStateData, event: any) => {
    return {
      ...data,
      navigationNode:
        data.options.find(({ value }) => event.value === value)?.element ||
        data.navigationNode,
      navigationValue: event.value,
    };
  }
);

function listboxLostFocus(data: ListboxStateData, event: any) {
  let inputHasFocus = document.activeElement === data.refs.input;
  let buttonHasFocus = document.activeElement === data.refs.button;
  if (!inputHasFocus && !buttonHasFocus && data.refs.popover) {
    return !data.refs.popover.contains(document.activeElement);
  }
  return inputHasFocus || buttonHasFocus;
}

function notRightClick(data: ListboxStateData, event: any) {
  return !event.isRightClick;
}

function focusList(data: ListboxStateData, event: any) {
  requestAnimationFrame(() => {
    data.refs.list && data.refs.list.focus();
  });
}

function focusOption(data: ListboxStateData, event: any) {
  requestAnimationFrame(() => {
    event.node && event.node.focus();
  });
}

function focusNavOption(data: ListboxStateData, event: any) {
  requestAnimationFrame(() => {
    console.log(data.navigationNode);
    data.navigationNode && data.navigationNode.focus();
  });
}

function focusButton(data: ListboxStateData, event: any) {
  requestAnimationFrame(() => {
    data.refs.button && data.refs.button.focus();
  });
}

function selectOption(data: ListboxStateData, event: any) {
  event.callback && event.callback(event.value);
}

function preventDefault(data: ListboxStateData, event: any) {
  event.domEvent && event.domEvent.preventDefault();
}

let setValueFromSearch = assign<ListboxStateData, any>((data, event) => {
  console.log("FUCKING GO");
  const searchValue = event.query
    ? findOptionValueFromSearch(data.options, event.query)
    : null;
  let newData = {
    ...data,
    typeaheadQuery: event.query,
    value: searchValue || data.value,
  };
  console.log({
    typeaheadQuery: event.query,
    value: searchValue || data.value,
  });
  return newData;
});

let setNavSelectionFromSearch = assign<ListboxStateData, any>((data, event) => {
  let searchValue = event.query
    ? findOptionValueFromSearch(data.options, event.query)
    : null;
  let newValue = searchValue || data.navigationValue;
  let newNode =
    data.options.find(option => newValue === option.value)?.element ||
    data.navigationNode;
  let newData = {
    ...data,
    typeaheadQuery: event.query,
    navigationValue: newValue,
    navigationNode: newNode,
  };
  console.log({
    searchValue,
    typeaheadQuery: event.query,
    value: searchValue || data.value,
  });
  return newData;
});

let commonEvents = {
  [ListboxEvents.GetDerivedData]: {
    actions: assign<ListboxStateData, any>((ctx, event) => {
      return {
        ...ctx,
        ...event.data,
        refs: {
          ...ctx.refs,
          ...(event.data.refs || {}),
        },
      };
    }),
  },
  [ListboxEvents.ValueChange]: {
    actions: [assignValue, selectOption],
  },
  [ListboxEvents.ClearTypeaheadQuery]: {
    actions: clearTypeaheadQuery,
  },
};

let openEvents = {
  [ListboxEvents.ClearNavSelection]: {
    actions: focusList,
  },
  [ListboxEvents.OptionSelect]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, focusButton, clearTypeaheadQuery],
  },
  [ListboxEvents.OptionFinishClick]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, focusButton, clearTypeaheadQuery],
    cond: notRightClick,
  },
  [ListboxEvents.Blur]: [
    {
      target: ListboxStates.Idle,
      cond: listboxLostFocus,
      actions: clearTypeaheadQuery,
    },
    {
      // TODO: Interacting state
      target: ListboxStates.Navigating,
      actions: clearTypeaheadQuery,
    },
  ],
  [ListboxEvents.ButtonPointerDown]: {
    target: ListboxStates.Idle,
    cond: notRightClick,
    actions: [focusButton, preventDefault],
  },
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Initializer for our state machine.
 *
 * @param initial
 * @param props
 */
export const createListboxMachine = ({
  value,
  disabled,
  isControlled,
  refs,
}: {
  value: ListboxValue | null;
  disabled: boolean;
  isControlled: boolean;
  refs: ListboxNodeRefs;
}) =>
  createMachine<ListboxStateData, ListboxEvent, ListboxState>({
    id: "mixed-checkbox",
    initial: ListboxStates.Idle,
    context: {
      disabled,
      isControlled,
      value,
      refs,
      options: [],
      navigationValue: null,
      navigationNode: null,
      typeaheadQuery: null,
    },
    states: {
      [ListboxStates.Idle]: {
        on: {
          ...commonEvents,
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Navigating,
            cond: notRightClick,
            actions: focusButton,
          },
          [ListboxEvents.ButtonFinishClick]: {
            target: ListboxStates.Navigating,
            cond: notRightClick,
            actions: focusNavOption,
          },
          [ListboxEvents.KeyDownSpace]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: focusNavOption,
          },
          [ListboxEvents.KeyDownSearch]: {
            target: ListboxStates.Idle,
            actions: setValueFromSearch,
          },
          [ListboxEvents.OptionSelect]: {
            actions: [
              assignValue,
              selectOption,
              focusOption,
              clearTypeaheadQuery,
            ],
          },
          [ListboxEvents.KeyDownNavigate]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
        },
      },
      [ListboxStates.Interacting]: {
        on: {
          ...commonEvents,
          ...openEvents,
          [ListboxEvents.Navigate]: {
            target: ListboxStates.Navigating,
            actions: [navigate, focusOption],
          },
          [ListboxEvents.KeyDownNavigate]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
        },
      },
      [ListboxStates.Navigating]: {
        on: {
          ...commonEvents,
          ...openEvents,
          [ListboxEvents.ButtonFinishClick]: {
            cond: notRightClick,
            actions: focusNavOption,
          },
          [ListboxEvents.Navigate]: {
            target: ListboxStates.Navigating,
            actions: [navigate, focusOption],
          },
          [ListboxEvents.KeyDownNavigate]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownSpace]: {
            target: ListboxStates.Idle,
            actions: [navigate, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownEnter]: {
            target: ListboxStates.Idle,
            actions: [preventDefault, navigate, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownSearch]: {
            actions: [setNavSelectionFromSearch, focusNavOption],
          },
        },
      },
      [ListboxStates.NavigatingWithKeys]: {
        on: {
          ...commonEvents,
          ...openEvents,
          [ListboxEvents.Navigate]: {
            target: ListboxStates.Navigating,
            actions: [navigate, focusOption],
          },
          [ListboxEvents.KeyDownNavigate]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownSpace]: {
            target: ListboxStates.Idle,
            actions: [navigate, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownEnter]: {
            target: ListboxStates.Idle,
            actions: [preventDefault, navigate, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownSearch]: {
            actions: [setNavSelectionFromSearch, focusNavOption],
          },
        },
      },
      [ListboxStates.Searching]: {
        on: {
          ...commonEvents,
          ...openEvents,
          [ListboxEvents.Navigate]: {
            target: ListboxStates.Navigating,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownNavigate]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
          [ListboxEvents.ClearTypeaheadQuery]: {
            target: ListboxStates.Navigating,
            actions: clearTypeaheadQuery,
          },
          [ListboxEvents.KeyDownSpace]: {
            target: ListboxStates.Idle,
            actions: [navigate, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownEnter]: {
            target: ListboxStates.Idle,
            actions: [preventDefault, navigate, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownSearch]: {
            actions: [setNavSelectionFromSearch, focusNavOption],
          },
        },
      },
    },
  });

export function unwrapRefs<
  TE extends MachineEventWithRefs = MachineEventWithRefs
>(refs: MachineToReactRefMap<TE>): TE["refs"] {
  return Object.entries(refs).reduce((value, [name, ref]) => {
    (value as any)[name] = ref.current;
    return value;
  }, {} as TE["refs"]);
}

export function useMachine<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs
>(
  initialMachine: StateMachine.Machine<TC, TE, any>,
  refs: MachineToReactRefMap<TE>
): [
  StateMachine.State<TC, TE, any>,
  StateMachine.Service<TC, DistributiveOmit<TE, "refs">>["send"],
  StateMachine.Service<TC, TE>
] {
  /*
   * State machine should not change between renders, so let's store it in a
   * ref. This should also help if we need to use a creator function to inject
   * dynamic initial state values based on props.
   */
  let { current: machine } = useRef(initialMachine);
  let service = useConstant(() => interpret(machine).start());
  let [current, setCurrent] = useState(machine.initialState);

  // Add refs to every event so we can use them to perform actions.
  let send = useCallback(
    (rawEvent: TE["type"] | DistributiveOmit<TE, "refs">) => {
      let event = typeof rawEvent === "string" ? { type: rawEvent } : rawEvent;
      let refValues = unwrapRefs(refs);
      let eventToSend = { ...event, refs: refValues } as TE;

      service.send(eventToSend);
      if (__DEV__) {
        console.group("Event Sent");
        console.log(
          "%c" + eventToSend.type,
          "font-weight: normal; font-size: 120%; font-style: italic;"
        );
        console.log(eventToSend);
        console.groupEnd();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    service.subscribe(setCurrent);
    return () => {
      service.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [current, send, service];
}

////////////////////////////////////////////////////////////////////////////////

function findOptionValueFromSearch(options: any[], string = "") {
  if (!string) return;
  const found = options.find(({ label }) => {
    console.log({ label });
    return label && label.toLowerCase().startsWith(string);
  });
  return found ? found.value : null;
}

////////////////////////////////////////////////////////////////////////////////
// Types
