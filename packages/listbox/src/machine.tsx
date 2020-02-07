import React, { useCallback, useEffect, useRef, useState } from "react";
import { DistributiveOmit, useConstant } from "@reach/utils";
import {
  assign,
  createMachine,
  EventObject as MachineEvent,
  interpret,
  StateMachine,
} from "@xstate/fsm";

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

  // The user is searching for an option with the keyboard while the menu is
  // collapsed
  SearchingCollapsed = "SEARCHING",

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
  OptionClick = "OPTION_CLICK",
  OptionMouseEnter = "OPTION_MOUSE_ENTER",

  // OptionSelect > User interacted with the list and selected something
  // OptionSet > Value change may have come from somewhere else (I.E., controlled button click)
  OptionSelect = "OPTION_SELECT",
  OptionSet = "OPTION_SET",

  OptionStartClick = "OPTION_START_CLICK",
  PopoverPointerDown = "POPOVER_POINTER_DOWN",
  PopoverPointerUp = "POPOVER_POINTER_UP",
  SearchForOption = "SEARCH_FOR_OPTION",
}

/**
 * DOM nodes for all of the refs used in the listbox state machine.
 */
export type ListboxNodeRefs = {
  button: HTMLButtonElement | null;
  input: HTMLDivElement | null;
  list: HTMLUListElement | null;
  popover: HTMLDivElement | null;
};

/**
 * Shared partial interface for all of our event objects.
 */
interface ListboxEventBase extends MachineEventWithRefs {
  refs: ListboxNodeRefs;
}

/**
 * Event object for the checkbox state machine.
 */
export type ListboxEvent = ListboxEventBase &
  (
    | {
        type: ListboxEvents.Blur;
      }
    | {
        type: ListboxEvents.GetDerivedData;
        data: Omit<Partial<ListboxStateData>, "refs"> & {
          refs?: Partial<ListboxStateData["refs"]>;
        };
      }
    | {
        type: ListboxEvents.ButtonPointerDown;
        isRightClick: boolean;
      }
    | {
        type: ListboxEvents.ButtonFinishClick;
        isRightClick: boolean;
      }
    | {
        type: ListboxEvents.ClearNavSelection;
      }
    | {
        type: ListboxEvents.ClearTypeaheadQuery;
      }
    | {
        type: ListboxEvents.Navigate;
        value: ListboxValue;
        node?: HTMLElement | null | undefined;
      }
    | {
        type: ListboxEvents.OptionSelect;
        value: ListboxValue;
        node?: HTMLElement | null | undefined;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.OptionSet;
        value: ListboxValue;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.KeyDownNavigate;
        value: ListboxValue | null;
        shouldManageFocus?: boolean;
        node?: HTMLElement | null | undefined;
        resetManagedFocus?(): void;
      }
    | {
        type: ListboxEvents.KeyDownSearch;
        query: string;
      }
    | {
        type: ListboxEvents.KeyDownEscape;
      }
    | {
        type: ListboxEvents.KeyDownEnter;
        value?: ListboxValue | null | undefined;
        domEvent?: KeyboardEvent;
      }
    | {
        type: ListboxEvents.KeyDownSpace;
        value?: ListboxValue | null | undefined;
      }
    | {
        type: ListboxEvents.OptionStartClick;
        isRightClick: boolean;
      }
    | {
        type: ListboxEvents.KeyDownTab;
      }
    | {
        type: ListboxEvents.SearchForOption;
        query: string;
      }
  );

/**
 * State object for the checkbox state machine.
 */
export type ListboxState = {
  value: ListboxStates;
  context: ListboxStateData;
};

////////////////////////////////////////////////////////////////////////////////
// Actions and conditions

let clearTypeaheadQuery = assign<ListboxStateData>({
  typeaheadQuery: null,
});

let assignValue = assign<ListboxStateData, any>({
  value: (_, event) => event.value,
});

let navigate = assign<ListboxStateData, any>({
  navigationValue: (_, event) => event.value,
});

function listboxLostFocus(data: ListboxStateData, event: any) {
  let inputHasFocus = document.activeElement === data.refs.input;
  let buttonHasFocus = document.activeElement === data.refs.button;
  if (!inputHasFocus && !buttonHasFocus && data.refs.popover) {
    return !data.refs.popover.contains(document.activeElement);
  }
  return inputHasFocus || buttonHasFocus;
}

function isNotRightClick(data: ListboxStateData, event: any) {
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
  [ListboxEvents.OptionSet]: {
    actions: [assignValue, selectOption, clearTypeaheadQuery],
  },
  [ListboxEvents.ClearTypeaheadQuery]: {
    actions: clearTypeaheadQuery,
  },
  [ListboxEvents.Blur]: {
    target: ListboxStates.Idle,
    actions: clearTypeaheadQuery,
  },
};

let openEvents = {
  [ListboxEvents.ClearNavSelection]: {
    actions: focusList,
  },
  [ListboxEvents.OptionSet]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, clearTypeaheadQuery],
  },
  [ListboxEvents.OptionSelect]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, focusButton, clearTypeaheadQuery],
  },
  [ListboxEvents.Blur]: [
    {
      target: ListboxStates.Idle,
      cond: listboxLostFocus,
      actions: clearTypeaheadQuery,
    },
    {
      target: ListboxStates.Interacting,
      actions: clearTypeaheadQuery,
    },
  ],
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
}: {
  value: ListboxValue;
  disabled: boolean;
  isControlled: boolean;
}) =>
  createMachine<ListboxStateData, ListboxEvent, ListboxState>({
    id: "mixed-checkbox",
    initial: ListboxStates.Idle,
    context: {
      disabled,
      isControlled,
      value,
      navigationValue: null,
      navigationNode: null,
      typeaheadQuery: null,
      refs: {
        input: null,
        list: null,
        button: null,
        popover: null,
      },
    },
    states: {
      [ListboxStates.Idle]: {
        on: {
          ...commonEvents,
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Navigating,
            cond: isNotRightClick,
            actions: focusButton,
          },
          [ListboxEvents.ButtonFinishClick]: {
            target: ListboxStates.Navigating,
            cond: isNotRightClick,
            actions: focusNavOption,
          },
          [ListboxEvents.KeyDownSpace]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: focusNavOption,
          },
          [ListboxEvents.KeyDownSearch]: {
            target: ListboxStates.Idle,
            actions: assign({
              typeaheadQuery: (data, event) => event.query,
            }),
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
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Idle,
            cond: isNotRightClick,
          },
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
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Idle,
            cond: isNotRightClick,
          },
          [ListboxEvents.ButtonFinishClick]: {
            cond: isNotRightClick,
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
        },
      },
      [ListboxStates.NavigatingWithKeys]: {
        on: {
          ...commonEvents,
          ...openEvents,
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Idle,
            cond: isNotRightClick,
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
        },
      },
      [ListboxStates.Searching]: {
        on: {
          ...commonEvents,
          ...openEvents,
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Idle,
            cond: isNotRightClick,
          },
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
        },
      },
      [ListboxStates.SearchingCollapsed]: {
        on: {
          ...commonEvents,
          [ListboxEvents.ButtonPointerDown]: {
            target: ListboxStates.Navigating,
            cond: isNotRightClick,
            actions: clearTypeaheadQuery,
          },
          [ListboxEvents.KeyDownEnter]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [focusNavOption, clearTypeaheadQuery],
          },
          [ListboxEvents.KeyDownSpace]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [focusNavOption, clearTypeaheadQuery],
          },
          [ListboxEvents.ClearTypeaheadQuery]: {
            target: ListboxStates.Idle,
            actions: clearTypeaheadQuery,
          },
          [ListboxEvents.KeyDownNavigate]: {
            target: ListboxStates.NavigatingWithKeys,
            actions: [navigate, focusOption, clearTypeaheadQuery],
          },
        },
      },
    },
  });

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
      let refValues = Object.keys(refs).reduce((value, name) => {
        (value as any)[name] = refs[name].current;
        return value;
      }, {});
      service.send({ ...event, refs: refValues } as TE);
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

export interface MachineEventWithRefs extends MachineEvent {
  refs: {
    [key: string]: any;
  };
}

export type MachineToReactRefMap<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

////////////////////////////////////////////////////////////////////////////////
// Types

export type ListboxValue = string;

export type ListboxStateData = {
  disabled: boolean;
  isControlled: boolean;
  navigationValue: ListboxValue | null;
  navigationNode: HTMLElement | null;
  refs: ListboxNodeRefs;
  typeaheadQuery: string | null;
  value: ListboxValue | null;
};
