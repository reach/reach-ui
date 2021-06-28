import { assign } from "@reach/machine";
import { getOwnerDocument } from "@reach/utils/owner-document";

import type { ListboxDescendant, ListboxValue } from "./index";
import type { MachineEventWithRefs, StateMachine } from "@reach/machine";

////////////////////////////////////////////////////////////////////////////////
// States

export enum ListboxStates {
  // Resting/closed state.
  Idle = "IDLE",

  // Listbox is open but the user is not yet navigating.
  Open = "OPEN",

  // The user is navigating the list
  Navigating = "NAVIGATING",

  // The user has moused-down but hasn't made a selection yet
  Dragging = "DRAGGING",

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

  OptionTouchStart = "OPTION_TOUCH_START",
  OptionMouseMove = "OPTION_MOUSE_MOVE",
  OptionMouseEnter = "OPTION_MOUSE_ENTER",
  OptionMouseDown = "OPTION_MOUSE_DOWN",
  OptionMouseUp = "OPTION_MOUSE_UP",
  OptionClick = "OPTION_CLICK",

  ListMouseUp = "LIST_MOUSE_UP",

  // WIP: Simplify and consolidate events
  // TODO: Use a separate machine to deal with states to determine press events
  OptionPress = "OPTION_PRESS",

  OutsideMouseDown = "OUTSIDE_MOUSE_DOWN",
  OutsideMouseUp = "OUTSIDE_MOUSE_UP",

  // Uncontrolled value changes come from specific events (click, key, etc.)
  // ValueChange > Value change may have come from somewhere else
  ValueChange = "VALUE_CHANGE",

  PopoverPointerDown = "POPOVER_POINTER_DOWN",
  PopoverPointerUp = "POPOVER_POINTER_UP",
  UpdateAfterTypeahead = "UPDATE_AFTER_TYPEAHEAD",
}

////////////////////////////////////////////////////////////////////////////////
// Actions and conditions

let clearNavigationValue = assign<ListboxStateData>({
  navigationValue: null,
});

let clearTypeahead = assign<ListboxStateData>({
  typeaheadQuery: null,
});

let assignValue = assign<ListboxStateData, any>({
  value: (_, event) => event.value,
});

let navigate = assign<ListboxStateData, any>({
  navigationValue: (data, event) => event.value,
});

let navigateFromCurrentValue = assign<ListboxStateData, any>({
  navigationValue: (data) => {
    // Before we navigate based on the current value, we need to make sure the
    // current value is selectable. If not, we should instead navigate to the
    // first selectable option.
    let selected = findOptionFromValue(data.value, data.options);
    if (selected && !selected.disabled) {
      return data.value;
    } else {
      return data.options.find((option) => !option.disabled)?.value || null;
    }
  },
});

function listboxLostFocus(data: ListboxStateData, event: ListboxEvent) {
  if (event.type === ListboxEvents.Blur) {
    let { list, popover } = event.refs;
    let { relatedTarget } = event;

    let ownerDocument = getOwnerDocument(popover);

    return !!(
      ownerDocument?.activeElement !== list &&
      popover &&
      !popover.contains(
        (relatedTarget as Element) || ownerDocument?.activeElement
      )
    );
  }
  return false;
}

function clickedOutsideOfListbox(data: ListboxStateData, event: ListboxEvent) {
  if (
    event.type === ListboxEvents.OutsideMouseDown ||
    event.type === ListboxEvents.OutsideMouseUp
  ) {
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
  return !!data.options.find((option) => option.value === data.navigationValue);
}

function shouldNavigate(data: ListboxStateData, event: any) {
  let { popover, list } = event.refs;
  let { relatedTarget } = event;
  // When a blur event happens, we want to move to Navigating state unless the
  // user is interacting with elements inside the popover...
  if (
    popover &&
    relatedTarget &&
    popover.contains(relatedTarget as Element) &&
    relatedTarget !== list
  ) {
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
  if (event.type === ListboxEvents.OptionTouchStart) {
    if (event && event.disabled) {
      return false;
    }
  }
  return true;
}

function optionIsSelectable(data: ListboxStateData, event: ListboxEvent) {
  if ("disabled" in event && event.disabled) {
    return false;
  }
  if ("value" in event) {
    return event.value != null;
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
      };
    }),
  },
  [ListboxEvents.ValueChange]: {
    actions: [assignValue, selectOption],
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
  id: "listbox",
  initial: ListboxStates.Idle,
  context: {
    value,
    options: [],
    navigationValue: null,
    typeaheadQuery: null,
  },
  states: {
    [ListboxStates.Idle]: {
      on: {
        ...commonEvents,
        [ListboxEvents.ButtonMouseDown]: {
          target: ListboxStates.Open,
          actions: [navigateFromCurrentValue],
          cond: listboxIsNotDisabled,
        },
        [ListboxEvents.KeyDownSpace]: {
          target: ListboxStates.Navigating,
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
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue, clearTypeahead, focusList],
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
        [ListboxEvents.ClearNavSelection]: {
          actions: [clearNavigationValue, focusList],
        },
        [ListboxEvents.KeyDownEnter]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.KeyDownSpace]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.ButtonMouseDown]: {
          target: ListboxStates.Idle,
          // When the user triggers a mouseDown event on the button, we call
          // event.preventDefault() because the browser will naturally send a
          // mouseup event and click, which will reopen the button (which we
          // don't want). As such, the click won't blur the open list or
          // re-focus the trigger, so we call `focusButton` to do that manually.
          // We could work around this with deferred transitions with xstate,
          // but @xstate/fsm currently doesn't support that feature and this
          // works good enough for the moment.
          actions: [focusButton],
        },
        [ListboxEvents.KeyDownEscape]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.OptionMouseDown]: {
          target: ListboxStates.Dragging,
        },
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Dragging,
            actions: clearTypeahead,
            cond: optionIsActive,
          },
        ],
        [ListboxEvents.OutsideMouseUp]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.KeyDownEnter]: ListboxStates.Interacting,
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: shouldNavigate,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.OptionTouchStart]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.OptionClick]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionPress]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionMouseEnter]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead, focusList],
        },
      },
    },
    [ListboxStates.Open]: {
      on: {
        ...commonEvents,
        [ListboxEvents.ClearNavSelection]: {
          actions: [clearNavigationValue],
        },
        [ListboxEvents.KeyDownEnter]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.KeyDownSpace]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.ButtonMouseDown]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.KeyDownEscape]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.OptionMouseDown]: {
          target: ListboxStates.Dragging,
        },
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Dragging,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.OutsideMouseUp]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: shouldNavigate,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.ButtonMouseUp]: {
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue, focusList],
        },
        [ListboxEvents.ListMouseUp]: {
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue, focusList],
        },
        [ListboxEvents.OptionTouchStart]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.OptionClick]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionPress]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead, focusList],
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.Navigating,
          actions: setTypeahead,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          actions: [setNavSelectionFromTypeahead],
        },
        [ListboxEvents.ClearTypeahead]: {
          actions: clearTypeahead,
        },
        [ListboxEvents.OptionMouseMove]: [
          {
            target: ListboxStates.Dragging,
            actions: [navigate],
            cond: optionIsNavigable,
          },
          {
            target: ListboxStates.Dragging,
          },
        ],
      },
    },
    [ListboxStates.Dragging]: {
      on: {
        ...commonEvents,
        [ListboxEvents.ClearNavSelection]: {
          actions: [clearNavigationValue],
        },
        [ListboxEvents.KeyDownEnter]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.KeyDownSpace]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.ButtonMouseDown]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.KeyDownEscape]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.OptionMouseDown]: {
          target: ListboxStates.Dragging,
        },
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.OutsideMouseUp]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
            actions: focusList,
          },
          {
            target: ListboxStates.Interacting,
            actions: [clearTypeahead, focusList],
          },
        ],
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: shouldNavigate,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.ButtonMouseUp]: {
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue, focusList],
        },
        [ListboxEvents.OptionTouchStart]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.OptionClick]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionPress]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionMouseEnter]: {
          target: ListboxStates.Dragging,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead, focusList],
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.Navigating,
          actions: setTypeahead,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          actions: [setNavSelectionFromTypeahead],
        },
        [ListboxEvents.ClearTypeahead]: {
          actions: clearTypeahead,
        },
        [ListboxEvents.OptionMouseMove]: [
          {
            target: ListboxStates.Navigating,
            actions: [navigate],
            cond: optionIsNavigable,
          },
          {
            target: ListboxStates.Navigating,
          },
        ],
        [ListboxEvents.OptionMouseUp]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
      },
    },
    [ListboxStates.Navigating]: {
      on: {
        ...commonEvents,
        [ListboxEvents.ClearNavSelection]: {
          actions: [clearNavigationValue, focusList],
        },
        [ListboxEvents.KeyDownEnter]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.KeyDownSpace]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.ButtonMouseDown]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.KeyDownEscape]: {
          target: ListboxStates.Idle,
          actions: [focusButton],
        },
        [ListboxEvents.OptionMouseDown]: {
          target: ListboxStates.Dragging,
        },
        [ListboxEvents.OutsideMouseDown]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.OutsideMouseUp]: [
          {
            target: ListboxStates.Idle,
            cond: clickedOutsideOfListbox,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: optionIsActive,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.Blur]: [
          {
            target: ListboxStates.Idle,
            cond: listboxLostFocus,
            actions: clearTypeahead,
          },
          {
            target: ListboxStates.Navigating,
            cond: shouldNavigate,
          },
          {
            target: ListboxStates.Interacting,
            actions: clearTypeahead,
          },
        ],
        [ListboxEvents.ButtonMouseUp]: {
          target: ListboxStates.Navigating,
          actions: [navigateFromCurrentValue, focusList],
        },
        [ListboxEvents.OptionTouchStart]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.OptionClick]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionPress]: {
          target: ListboxStates.Idle,
          actions: [assignValue, clearTypeahead, focusButton, selectOption],
          cond: optionIsSelectable,
        },
        [ListboxEvents.OptionMouseEnter]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead],
          cond: optionIsNavigable,
        },
        [ListboxEvents.KeyDownNavigate]: {
          target: ListboxStates.Navigating,
          actions: [navigate, clearTypeahead, focusList],
        },
        [ListboxEvents.KeyDownSearch]: {
          target: ListboxStates.Navigating,
          actions: setTypeahead,
        },
        [ListboxEvents.UpdateAfterTypeahead]: {
          actions: [setNavSelectionFromTypeahead],
        },
        [ListboxEvents.ClearTypeahead]: {
          actions: clearTypeahead,
        },
        [ListboxEvents.OptionMouseMove]: [
          {
            target: ListboxStates.Navigating,
            actions: [navigate],
            cond: optionIsNavigable,
          },
          {
            target: ListboxStates.Navigating,
          },
        ],
      },
    },
  },
});

////////////////////////////////////////////////////////////////////////////////

function findOptionFromTypeahead(options: ListboxDescendant[], string = "") {
  if (!string) return null;
  const found = options.find(
    (option) =>
      !option.disabled &&
      option.label &&
      option.label.toLowerCase().startsWith(string.toLowerCase())
  );
  return found || null;
}

function findOptionFromValue(
  value: string | null | undefined,
  options: ListboxDescendant[]
) {
  return value ? options.find((option) => option.value === value) : undefined;
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
  selectedOption: HTMLElement | null;
  highlightedOption: HTMLElement | null;
};

/**
 * Event object for the listbox state machine.
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
        type: ListboxEvents.OutsideMouseUp;
        relatedTarget: EventTarget | null;
      }
    | {
        type: ListboxEvents.GetDerivedData;
        data: Partial<ListboxStateData>;
      }
    | {
        type: ListboxEvents.ButtonMouseDown;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.ButtonMouseUp;
      }
    | {
        type: ListboxEvents.ListMouseUp;
      }
    | {
        type: ListboxEvents.ClearNavSelection;
      }
    | {
        type: ListboxEvents.OptionTouchStart;
        value: ListboxValue;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.OptionMouseEnter;
        value: ListboxValue;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.OptionMouseMove;
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
        type: ListboxEvents.OptionMouseDown;
      }
    | {
        type: ListboxEvents.OptionMouseUp;
        value: ListboxValue | null | undefined;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.OptionClick;
        value: ListboxValue | null | undefined;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
        disabled: boolean;
      }
    | {
        type: ListboxEvents.OptionPress;
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
 * State object for the listbox state machine.
 */
export type ListboxState = {
  value: ListboxStates;
  context: ListboxStateData;
};

export type ListboxStateData = {
  navigationValue: ListboxValue | null;
  typeaheadQuery: string | null;
  value: ListboxValue | null;
  options: ListboxDescendant[];
};
