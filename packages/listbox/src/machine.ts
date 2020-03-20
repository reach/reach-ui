import { useCallback, useEffect, useRef, useState } from "react";
import { Descendant } from "@reach/descendants";
import {
  assign,
  interpret,
  MachineEventWithRefs,
  MachineToReactRefMap,
  StateMachine,
} from "@reach/machine";
import { DistributiveOmit, getOwnerDocument, useConstant } from "@reach/utils";
import {
  ListboxDescendant,
  ListboxDescendantProps,
  ListboxValue,
} from "./index";

let __DEBUG__ = true;

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
  ButtonMouseDown = "BUTTON_MOUSE_DOWN",
  ButtonMouseUp = "BUTTON_MOUSE_UP",
  Blur = "BLUR",
  ClearNavSelection = "CLEAR_NAV_SELECTION",
  ClearTypeahead = "CLEAR_TYPEAHEAD",
  GetDerivedData = "GET_DERIVED_DATA",
  KeyDownEscape = "KEY_DOWN_ESCAPE",
  KeyDownEnter = "KEY_DOWN_ENTER",
  KeyDownSpace = "KEY_DOWN_SPACE",
  KeyDownNavigate = "KEY_DOWN_NAVIGATE",
  KeyDownSearch = "KEY_DOWN_SEARCH",
  KeyDownTab = "KEY_DOWN_TAB",
  KeyDownShiftTab = "KEY_DOWN_SHIFT_TAB",
  Navigate = "NAVIGATE",
  OptionMouseEnter = "OPTION_MOUSE_ENTER",
  OutsideMouseDown = "OUTSIDE_MOUSE_DOWN",

  // Uncontrolled value changes come from specific events (click, key, etc.)
  // ValueChange > Value change may have come from somewhere else
  ValueChange = "VALUE_CHANGE",

  OptionStartClick = "OPTION_START_CLICK",
  OptionFinishClick = "OPTION_FINISH_CLICK",
  PopoverPointerDown = "POPOVER_POINTER_DOWN",
  PopoverPointerUp = "POPOVER_POINTER_UP",
  UpdateAfterTypeahead = "UPDATE_AFTER_TYPEAHEAD",
}

////////////////////////////////////////////////////////////////////////////////
// Actions and conditions

let clearNavigationValue = assign<ListboxStateData>({
  navigationValue: null,
});

let clearTypeaheadQuery = assign<ListboxStateData>({
  typeaheadQuery: null,
});

let assignValue = assign<ListboxStateData, any>({
  value: (_, event) => event.value,
});

let navigate = assign<ListboxStateData, any>({
  navigationValue: (data, event) => event.value,
});

let navigateFromCurrentValue = assign<ListboxStateData, any>({
  navigationValue: data => {
    // Before we navigate based on the current value, we need to make sure the
    // current value is selectable. If not, we should instead navigate to the
    // first selectable option.
    let selected = findOptionFromValue(data.value, data.options);
    if (selected && !selected.disabled) {
      return data.value;
    } else {
      return data.options.find(option => !option.disabled)?.value || null;
    }
  },
});

function listboxLostFocus(data: ListboxStateData, event: ListboxEvent) {
  if (event.type === ListboxEvents.Blur) {
    let { list, popover } = event.refs;
    let { relatedTarget } = event;

    let ownerDocument = (popover && getOwnerDocument(popover)) || document;

    return !!(
      ownerDocument.activeElement !== list &&
      popover &&
      !popover.contains(
        (relatedTarget as Element) || ownerDocument.activeElement
      )
    );
  }
  return false;
}

function clickedOutsideOfListbox(data: ListboxStateData, event: ListboxEvent) {
  if (event.type === ListboxEvents.OutsideMouseDown) {
    let { button, popover } = event.refs;
    let { relatedTarget } = event;

    // Close the popover IF:
    return !!(
      // clicked element is not the button
      (
        relatedTarget !== button &&
        // clicked element is not inside the button
        button &&
        !button.contains(relatedTarget as Element) &&
        // clicked element is not inside the popover
        popover &&
        !popover.contains(relatedTarget as Element)
      )
    );
  }
  return false;
}

function optionIsActive(data: ListboxStateData, event: any) {
  return !!data.options.find(option => option.value === data.navigationValue);
}

function shouldNavigateWithKeys(data: ListboxStateData, event: any) {
  let { popover } = event.refs;
  let { relatedTarget } = event;
  // When a blur event happens, we want to move to NavigatingWithKeys state
  // unless the user is interacting with elements inside the popover...
  if (popover && relatedTarget && popover.contains(relatedTarget as Element)) {
    return false;
  }
  // ...otherwise, just make sure the next option is selectable
  return optionIsActive(data, event);
}

function focusList(data: ListboxStateData, event: any) {
  requestAnimationFrame(() => {
    event.refs.list && event.refs.list.focus();
  });
}

function focusButton(data: ListboxStateData, event: any) {
  event.refs.button && event.refs.button.focus();
}

function listboxIsNotDisabled(data: ListboxStateData, event: any) {
  return !event.disabled;
}

function optionIsNavigable(data: ListboxStateData, event: ListboxEvent) {
  if (event.type === ListboxEvents.Navigate) {
    if (event && event.disabled) {
      return false;
    }
  }
  return true;
}

function optionIsSelectable(data: ListboxStateData, event: any) {
  if (event && event.disabled) {
    return false;
  }
  return data.navigationValue != null;
}

function selectOption(data: ListboxStateData, event: any) {
  event.callback && event.callback(event.value);
}

function submitForm(data: ListboxStateData, event: any) {
  if (event.type !== ListboxEvents.KeyDownEnter) {
    return;
  }

  // So this one is a little weird, but here's what we're doing.
  // When a user presses Enter in the context of a form, the form
  // should submit. Now I know you're probably thinking:
  //
  //      "Aha! I've got it!"
  //          > inputNode.form.submit()
  //      ** cracks knuckles ** "Phew. My work here is done."
  //
  // But alas, we are not so lucky. What's really happening when a
  // user presses enter in a normal form field is that the browser
  // looks at the form the input is in, then looks for the first
  // button or input in that form where its type property is `submit`,
  // then it triggers a click event on that button. COOL, CARRY ON.
  //
  // If we were to fire inputNode.form.submit(), this would bypass any
  // onSubmit handler in the form and just do what the browser
  // normally does when you submit a form and trigger a page refresh.
  // No bueno. So we do what the browser does and just go on a duck
  // hunt for the first submit button in the form and we click that
  // sucker.
  let { hiddenInput } = event.refs;
  if (hiddenInput && hiddenInput.form) {
    let submitButton = hiddenInput.form.querySelector("button,[type='submit']");
    submitButton && (submitButton as any).click();
  }
}

let setTypeahead = assign<ListboxStateData, any>({
  typeaheadQuery: (data, event) => {
    return (data.typeaheadQuery || "") + event.query;
  },
});

let clearTypeahead = assign<ListboxStateData, any>({
  typeaheadQuery: "",
});

let setValueFromTypeahead = assign<ListboxStateData, ListboxEvent>({
  value: (data, event) => {
    if (event.type === ListboxEvents.UpdateAfterTypeahead && event.query) {
      let match = findOptionFromTypeahead(data.options, event.query);
      if (match && !match.disabled) {
        event.callback && event.callback(match.value);
        return match.value;
      }
    }
    return data.value;
  },
});

let setNavSelectionFromTypeahead = assign<ListboxStateData, ListboxEvent>({
  navigationValue: (data, event) => {
    if (event.type === ListboxEvents.UpdateAfterTypeahead && event.query) {
      let match = findOptionFromTypeahead(data.options, event.query);
      if (match && !match.disabled) {
        return match.value;
      }
    }
    return data.navigationValue;
  },
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
};

let openEvents = {
  [ListboxEvents.ClearNavSelection]: {
    actions: [clearNavigationValue, focusList],
  },
  [ListboxEvents.OptionFinishClick]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, focusButton, clearTypeaheadQuery],
    cond: optionIsSelectable,
  },
  [ListboxEvents.KeyDownEnter]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, focusButton, clearTypeaheadQuery],
    cond: optionIsSelectable,
  },
  [ListboxEvents.KeyDownSpace]: {
    target: ListboxStates.Idle,
    actions: [assignValue, selectOption, focusButton, clearTypeaheadQuery],
    cond: optionIsSelectable,
  },
  [ListboxEvents.ButtonMouseDown]: {
    target: ListboxStates.Idle,
    // When the user triggers a mouseDown event on the button, we call
    // event.preventDefault() because the browser will naturally call mouseUp
    // and click, which will reopen the button (which we don't want). As such,
    // the click won't blur the open list or re-focus the trigger, so we call
    // `focusButton` to do that manually. We could work around this with
    // deferred transitions with xstate, but @xstate/fsm currently doesn't
    // support that feature and this works good enough for the moment.
    actions: [focusButton],
  },
  [ListboxEvents.KeyDownEscape]: {
    target: ListboxStates.Idle,
    actions: [focusButton],
  },
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Initializer for our state machine.
 *
 * @param initial
 * @param props
 */
export const createMachineDefinition = ({
  value,
}: {
  value: ListboxValue | null;
}): StateMachine.Config<ListboxStateData, ListboxEvent, ListboxState> => ({
  id: "mixed-checkbox",
  initial: ListboxStates.Idle,
  context: {
    value,
    refs: {
      button: null,
      input: null,
      list: null,
      popover: null,
      hiddenInput: null,
    },
    options: [],
    navigationValue: null,
    typeaheadQuery: null,
  },
  states: {
    [ListboxStates.Idle]: {
      on: {
        ...commonEvents,
        [ListboxEvents.ButtonMouseDown]: {
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue],
          cond: listboxIsNotDisabled,
        },
        [ListboxEvents.KeyDownSpace]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: [navigateFromCurrentValue, focusList],
          cond: listboxIsNotDisabled,
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.Idle,
          actions: setTypeahead,
          cond: listboxIsNotDisabled,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          target: ListboxStates.Idle,
          actions: [setValueFromTypeahead],
          cond: listboxIsNotDisabled,
        },
        [ListboxEvents.ClearTypeahead]: {
          target: ListboxStates.Idle,
          actions: clearTypeahead,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: [navigateFromCurrentValue, clearTypeaheadQuery],
          cond: listboxIsNotDisabled,
        },
        [ListboxEvents.KeyDownEnter]: {
          actions: [submitForm],
          cond: listboxIsNotDisabled,
        },
      },
    },
    [ListboxStates.Interacting]: {
      entry: [clearNavigationValue],
      on: {
        ...commonEvents,
        ...openEvents,
        [ListboxEvents.KeyDownEnter]: ListboxStates.Interacting,
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.Navigating,
            cond: shouldNavigateWithKeys,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.Navigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: [navigate, clearTypeaheadQuery, focusList],
        },
      },
    },
    [ListboxStates.Navigating]: {
      on: {
        ...commonEvents,
        ...openEvents,
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.Navigating,
            cond: shouldNavigateWithKeys,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.ButtonMouseUp]: {
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue, focusList],
        },
        [ListboxEvents.Navigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: [navigate, clearTypeaheadQuery, focusList],
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: setTypeahead,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          actions: [setNavSelectionFromTypeahead],
        },
        [ListboxEvents.ClearTypeahead]: {
          actions: clearTypeahead,
        },
      },
    },
    [ListboxStates.NavigatingWithKeys]: {
      on: {
        ...commonEvents,
        ...openEvents,
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.NavigatingWithKeys,
            cond: shouldNavigateWithKeys,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.NavigatingWithKeys,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.Navigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: [navigate, clearTypeaheadQuery, focusList],
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: setTypeahead,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          actions: [setNavSelectionFromTypeahead],
        },
        [ListboxEvents.ClearTypeahead]: {
          actions: clearTypeahead,
        },
      },
    },
    [ListboxStates.Searching]: {
      on: {
        ...commonEvents,
        ...openEvents,
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.Searching,
            cond: shouldNavigateWithKeys,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeaheadQuery,
          },
          {
            target: ListboxStates.Searching,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeaheadQuery,
          },
        ],
        [ListboxEvents.Navigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeaheadQuery],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: [navigate, clearTypeaheadQuery, focusList],
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.NavigatingWithKeys,
          actions: setTypeahead,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          actions: [setNavSelectionFromTypeahead],
        },
        [ListboxEvents.ClearTypeahead]: {
          actions: clearTypeahead,
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

      if (__DEV__ && __DEBUG__) {
        console.group("Event Sent");
        console.log(
          "%c" + eventToSend.type,
          "font-weight: normal; font-size: 120%; font-style: italic;"
        );
        console.log(eventToSend);
        console.groupEnd();
      }
      service.send(eventToSend);
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

function findOptionFromTypeahead(
  options: Descendant<HTMLElement, ListboxDescendantProps>[],
  string = ""
) {
  if (!string) return null;
  const found = options.find(
    option =>
      !option.disabled &&
      option.label &&
      option.label.toLowerCase().startsWith(string.toLowerCase())
  );
  return found || null;
}

function findOptionFromValue(
  value: string | null | undefined,
  options: Descendant<HTMLElement, ListboxDescendantProps>[]
) {
  return value ? options.find(option => option.value === value) : undefined;
}

////////////////////////////////////////////////////////////////////////////////
// Types

/**
 * Shared partial interface for all of our event objects.
 */
export interface ListboxEventBase extends MachineEventWithRefs {
  refs: ListboxNodeRefs;
}

/**
 * DOM nodes for all of the refs used in the listbox state machine.
 */
export type ListboxNodeRefs = {
  button: HTMLElement | null;
  hiddenInput: HTMLInputElement | null;
  input: HTMLElement | null;
  list: HTMLElement | null;
  popover: HTMLElement | null;
};

/**
 * Event object for the checkbox state machine.
 */
export type ListboxEvent = ListboxEventBase &
  (
    | {
        type: ListboxEvents.Blur;
        relatedTarget: EventTarget | null;
      }
    | {
        type: ListboxEvents.OutsideMouseDown;
        relatedTarget: EventTarget | null;
      }
    | {
        type: ListboxEvents.GetDerivedData;
        data: Omit<Partial<ListboxStateData>, "refs"> & {
          refs?: Partial<ListboxStateData["refs"]>;
        };
      }
    | {
        type: ListboxEvents.ButtonMouseDown;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.ButtonMouseUp;
      }
    | {
        type: ListboxEvents.ClearNavSelection;
      }
    | {
        type: ListboxEvents.Navigate;
        value: ListboxValue;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.ValueChange;
        value: ListboxValue;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.KeyDownNavigate;
        value: ListboxValue | null;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.KeyDownSearch;
        query: string;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.KeyDownEscape;
      }
    | {
        type: ListboxEvents.KeyDownEnter;
        value?: ListboxValue | null | undefined;
        disabled?: boolean;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.KeyDownSpace;
        value?: ListboxValue | null | undefined;
        disabled?: boolean;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.OptionStartClick;
      }
    | {
        type: ListboxEvents.OptionFinishClick;
        value: ListboxValue | null | undefined;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.KeyDownTab;
      }
    | {
        type: ListboxEvents.KeyDownShiftTab;
      }
    | {
        type: ListboxEvents.UpdateAfterTypeahead;
        query: string;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.ClearTypeahead;
      }
  );

/**
 * State object for the checkbox state machine.
 */
export type ListboxState = {
  value: ListboxStates;
  context: ListboxStateData;
};

export type ListboxStateData = {
  navigationValue: ListboxValue | null;
  refs: ListboxNodeRefs;
  typeaheadQuery: string | null;
  value: ListboxValue | null;
  options: ListboxDescendant[];
};
