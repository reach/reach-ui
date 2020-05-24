import { assign, MachineEventWithRefs, StateMachine } from "@reach/machine";
// import { getOwnerDocument } from "@reach/utils";
import { ComboboxValue } from "./index";

////////////////////////////////////////////////////////////////////////////////
// States

export enum ComboboxStates {
  // Nothing going on, waiting for the user to type or use the arrow keys
  Idle = "IDLE",
  // The component is suggesting options as the user types
  Suggesting = "SUGGESTING",
  // The user is using the keyboard to navigate the list, not typing
  Navigating = "NAVIGATING",
  // The user is interacting with arbitrary elements inside the popup that
  // are not ComboboxInputs
  Interacting = "INTERACTING",
}

////////////////////////////////////////////////////////////////////////////////
// Events

export enum ComboboxEvents {
  // User cleared the value w/ backspace, but input still has focus
  Clear = "CLEAR",
  // User is typing
  Change = "CHANGE",
  // Initial input value change handler for syncing user state with state
  // machine. Prevents initial change from sending the user to the Navigating
  // state.
  InitialChange = "INITIAL_CHANGE",
  // User is navigating w/ the keyboard
  Navigate = "NAVIGATE",
  // User can be navigating with keyboard and then click instead, we want the
  // value from the click, not the current nav item
  SelectWithKeyboard = "SELECT_WITH_KEYBOARD",
  SelectWithClick = "SELECT_WITH_CLICK",
  // Pretty self-explanatory, user can hit escape or blur to close the popover
  Escape = "ESCAPE",
  Blur = "BLUR",
  // The user left the input to interact with arbitrary elements inside the
  // popup
  Interact = "INTERACT",
  Focus = "FOCUS",
  ClickButton = "CLICK_BUTTON",
}

////////////////////////////////////////////////////////////////////////////////
// Actions and conditions

const shouldOpenOnFocus = (ctx: ComboboxStateData, event: ComboboxEvent) => {
  return event.type === ComboboxEvents.Focus && !!event.openOnFocus;
};

const clearNavigationValue = assign<ComboboxStateData, ComboboxEvent>({
  navigationValue: null,
});

const clearValue = assign<ComboboxStateData, ComboboxEvent>({
  value: "",
});

const setValue = assign<ComboboxStateData, any>({
  value: (ctx, event) =>
    typeof event.value !== "undefined" ? event.value : ctx.value,
});

const setNavigationValue = assign<ComboboxStateData, any>({
  navigationValue: (_, event) => {
    return event.value || null;
  },
});

const setValueFromNavigationValue = assign<ComboboxStateData, any>({
  value: (ctx) => ctx.navigationValue || null,
});

const setInitialNavigationValue = assign<ComboboxStateData, ComboboxEvent>({
  navigationValue: (ctx, event) => {
    if (
      event.type === ComboboxEvents.Navigate ||
      event.type === ComboboxEvents.ClickButton
    ) {
      return event.persistSelection ? ctx.value : null;
    }
    return null;
  },
});

function focusInput(_: any, event: any) {
  if (event.type !== ComboboxEvents.SelectWithClick) {
    event.refs.input?.focus();
  }
}

// TODO: Gross, make not gross maybe
function focusInputAfterRaf(_: any, event: any) {
  requestAnimationFrame(() => {
    focusInput(_, event);
  });
}

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
  value: ComboboxValue | null;
}): StateMachine.Config<ComboboxStateData, ComboboxEvent, ComboboxState> => ({
  id: "combobox",
  initial: ComboboxStates.Idle,
  context: {
    // The value the user has typed. We derive this also when the developer is
    // controlling the value of ComboboxInput.
    value,
    // options: [],
    navigationValue: null,
  },
  states: {
    [ComboboxStates.Idle]: {
      on: {
        [ComboboxEvents.Change]: {
          target: ComboboxStates.Suggesting,
          actions: [clearNavigationValue, setValue],
        },
        [ComboboxEvents.InitialChange]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue, setValue],
        },
        [ComboboxEvents.Blur]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
        [ComboboxEvents.Clear]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue, clearValue],
        },
        [ComboboxEvents.Focus]: [
          {
            target: ComboboxStates.Suggesting,
            actions: [setNavigationValue],
            cond: shouldOpenOnFocus,
          },
          {
            target: ComboboxStates.Idle,
          },
        ],
        [ComboboxEvents.Navigate]: {
          target: ComboboxStates.Navigating,
          actions: [setInitialNavigationValue, focusInput],
        },
        [ComboboxEvents.ClickButton]: {
          target: ComboboxStates.Suggesting,
          actions: [setInitialNavigationValue, focusInputAfterRaf],
        },
      },
    },
    [ComboboxStates.Suggesting]: {
      on: {
        [ComboboxEvents.Change]: {
          target: ComboboxStates.Suggesting,
          actions: [clearNavigationValue, setValue],
        },
        [ComboboxEvents.Focus]: [
          {
            target: ComboboxStates.Suggesting,
            actions: [setNavigationValue],
            cond: shouldOpenOnFocus,
          },
          {
            target: ComboboxStates.Suggesting,
          },
        ],
        [ComboboxEvents.Navigate]: {
          target: ComboboxStates.Navigating,
          actions: [setNavigationValue, focusInput],
        },
        [ComboboxEvents.Clear]: {
          target: ComboboxStates.Idle,
          actions: [clearValue, clearNavigationValue],
        },
        [ComboboxEvents.Escape]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue, focusInput],
        },
        [ComboboxEvents.Blur]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
        [ComboboxEvents.SelectWithClick]: {
          target: ComboboxStates.Idle,
          actions: [setValue, clearNavigationValue, focusInput],
        },
        [ComboboxEvents.Interact]: {
          target: ComboboxStates.Interacting,
        },
        [ComboboxEvents.ClickButton]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
      },
    },
    [ComboboxStates.Navigating]: {
      on: {
        [ComboboxEvents.Change]: {
          target: ComboboxStates.Suggesting,
          actions: [clearNavigationValue, setValue],
        },
        [ComboboxEvents.Focus]: [
          {
            target: ComboboxStates.Suggesting,
            actions: [setNavigationValue],
            cond: shouldOpenOnFocus,
          },
          {
            target: ComboboxStates.Navigating,
          },
        ],
        [ComboboxEvents.Clear]: {
          target: ComboboxStates.Idle,
          actions: [clearValue, clearNavigationValue],
        },
        [ComboboxEvents.Blur]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
        [ComboboxEvents.Escape]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue, focusInput],
        },
        [ComboboxEvents.Navigate]: {
          target: ComboboxStates.Navigating,
          actions: [setNavigationValue, focusInput],
        },
        [ComboboxEvents.SelectWithClick]: {
          target: ComboboxStates.Idle,
          actions: [setValue, clearNavigationValue, focusInput],
        },
        [ComboboxEvents.SelectWithKeyboard]: {
          target: ComboboxStates.Idle,
          actions: [setValueFromNavigationValue, clearNavigationValue],
        },
        [ComboboxEvents.ClickButton]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
        [ComboboxEvents.Interact]: {
          target: ComboboxStates.Interacting,
        },
      },
    },
    [ComboboxStates.Interacting]: {
      on: {
        [ComboboxEvents.Change]: {
          target: ComboboxStates.Suggesting,
          actions: [clearNavigationValue, setValue],
        },
        [ComboboxEvents.Clear]: {
          target: ComboboxStates.Idle,
          actions: [clearValue, clearNavigationValue],
        },
        [ComboboxEvents.Focus]: [
          {
            target: ComboboxStates.Suggesting,
            actions: [setNavigationValue],
            cond: shouldOpenOnFocus,
          },
          {
            target: ComboboxStates.Interacting,
          },
        ],
        [ComboboxEvents.Blur]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
        [ComboboxEvents.Escape]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue, focusInput],
        },
        [ComboboxEvents.Navigate]: {
          target: ComboboxStates.Navigating,
          actions: [setNavigationValue, focusInput],
        },
        [ComboboxEvents.ClickButton]: {
          target: ComboboxStates.Idle,
          actions: [clearNavigationValue],
        },
        [ComboboxEvents.SelectWithClick]: {
          target: ComboboxStates.Idle,
          actions: [setValue, clearNavigationValue, focusInput],
        },
      },
    },
  },
});

/**
 * State object for the state machine.
 */
export type ComboboxState = {
  value: ComboboxStates;
  context: ComboboxStateData;
};

////////////////////////////////////////////////////////////////////////////////
// Types

export type ComboboxStateData = {
  navigationValue?: string | null;
  value?: string | null;
};

/**
 * Shared partial interface for all of our event objects.
 */
export interface ComboboxEventBase extends MachineEventWithRefs {
  refs: ComboboxNodeRefs;
}

/**
 * DOM nodes for all of the refs used in the  state machine.
 */
export type ComboboxNodeRefs = {
  input: HTMLInputElement | null;
};

export type ComboboxEvent = ComboboxEventBase &
  (
    | { type: ComboboxEvents.Blur }
    | { type: ComboboxEvents.Change; value: ComboboxValue }
    | { type: ComboboxEvents.InitialChange; value: ComboboxValue }
    | { type: ComboboxEvents.Clear }
    | { type: ComboboxEvents.Escape }
    | { type: ComboboxEvents.Focus; openOnFocus?: boolean }
    | { type: ComboboxEvents.Interact }
    | {
        type: ComboboxEvents.Navigate;
        persistSelection?: boolean;
        value?: ComboboxValue | null;
      }
    | { type: ComboboxEvents.ClickButton; persistSelection?: boolean }
    | {
        type: ComboboxEvents.SelectWithClick;
        value: ComboboxValue;
      }
    | {
        type: ComboboxEvents.SelectWithKeyboard;
      }
  );
