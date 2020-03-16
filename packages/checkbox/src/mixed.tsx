/**
 * A MixedCheckbox simply renders an HTML input element where type="checked".
 * Whereas the native element technically only has two states, there is a third
 * visual state of `indeterminate` that is designed to suggest that a user has
 * fulfilled some part of whatever the checkbox is meant to control. For
 * example, you may have  multiple checkboxes nested in a hierarchy like a
 * checklist that looks like:
 *
 *   [-] All fruits
 *     [ ] Apple
 *     [x] Banana
 *     [x] Orange
 *
 * The `All fruits` checkbox is in an indeterminate state because some (but not
 * all) fruits in the list are checked. While this effect is possible with plain
 * input components, the MixedCheckbox component makes managing/syncing its
 * state with the correct DOM attributes much simpler.
 *
 * A mixed checkbox is not something you can naturally toggle by simply clicking
 * the box itself. As such, you should manage its state in your app by passing a
 * `checked` prop and an `onChange` handler.
 *
 * If you don't need an indeterminate state, you should probably just use a
 * native HTML input for your checkboxes. But of course, sometimes designers
 * have some other ideas that call for a custom solution. In that case, the
 * @reach/checkbox/custom package provides a customizable wrapper element that
 * can be styled to fit your needs.
 *
 * @see Docs     https://reacttraining.com/reach-ui/checkbox#mixedcheckbox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/checkbox/src/mixed
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#checkbox
 */

import React, { forwardRef, useEffect, useRef } from "react";
import {
  useForkedRef,
  useIsomorphicLayoutEffect,
  wrapEvent,
} from "@reach/utils";
import {
  assign,
  MachineEventWithRefs,
  StateMachine,
  useCreateMachine,
  useMachine,
  useMachineLogger,
} from "@reach/machine";
import PropTypes from "prop-types";
import warning from "warning";

// Used for development only, not recommended for production code!
const DEBUG = false;

////////////////////////////////////////////////////////////////////////////////
// States

export enum MixedCheckboxStates {
  Checked = "checked",
  Mixed = "mixed",
  Unchecked = "unchecked",
}

////////////////////////////////////////////////////////////////////////////////
// Events

export enum MixedCheckboxEvents {
  GetDerivedData = "GET_DERIVED_DATA",
  Mount = "MOUNT",
  Set = "SET",
  Toggle = "TOGGLE",
  Unmount = "UNMOUNT",
}

////////////////////////////////////////////////////////////////////////////////
// Actions & Conditions

/**
 * Toggle events will only update state if the checkbox component is
 * uncontrolled and not disabled.
 *
 * @param context
 */
function checkToggleAllowed(data: MixedCheckboxData) {
  return !!(data && !data.isControlled && !data.disabled);
}

/**
 * Set events will update state if the checkbox component is controlled and
 * the state target state matches the state passed in the event.
 *
 * @param state
 */
function getCheckSetCondition(state: string) {
  return function(data: MixedCheckboxData, event: any) {
    return data && data.isControlled && event.state === state;
  };
}

/**
 * Assign refs to the machine's context data
 */
const assignRefs = assign(
  (data: MixedCheckboxData, event: MixedCheckboxEvent) => {
    return {
      ...data,
      refs: event.refs,
    };
  }
);

////////////////////////////////////////////////////////////////////////////////
// State Machine

const commonEvents = {
  [MixedCheckboxEvents.Mount]: {
    actions: assignRefs,
  },
  [MixedCheckboxEvents.GetDerivedData]: {
    actions: [
      assignRefs,
      assign((data: MixedCheckboxData, event: any) => {
        return {
          ...data,
          ...event.data,
        };
      }),
    ],
  },
  [MixedCheckboxEvents.Set]: [
    {
      target: MixedCheckboxStates.Checked,
      cond: getCheckSetCondition(MixedCheckboxStates.Checked),
    },
    {
      target: MixedCheckboxStates.Unchecked,
      cond: getCheckSetCondition(MixedCheckboxStates.Unchecked),
    },
    {
      target: MixedCheckboxStates.Mixed,
      cond: getCheckSetCondition(MixedCheckboxStates.Mixed),
    },
  ],
};

/**
 * Initializer for our state machine.
 *
 * @param initial
 * @param props
 */
export const createMachineDefinition = (
  initial: MixedCheckboxStates,
  props: {
    disabled: boolean;
    isControlled: boolean;
  }
): StateMachine.Config<MixedCheckboxData, MixedCheckboxEvent> => ({
  id: "mixed-checkbox",
  initial,
  context: {
    disabled: props.disabled,
    isControlled: props.isControlled,
    refs: {
      input: null,
    },
  },
  states: {
    [MixedCheckboxStates.Unchecked]: {
      entry: assignRefs,
      on: {
        [MixedCheckboxEvents.Toggle]: {
          target: MixedCheckboxStates.Checked,
          cond: checkToggleAllowed,
        },
        ...commonEvents,
      },
    },
    [MixedCheckboxStates.Checked]: {
      entry: assignRefs,
      on: {
        [MixedCheckboxEvents.Toggle]: {
          target: MixedCheckboxStates.Unchecked,
          cond: checkToggleAllowed,
        },
        ...commonEvents,
      },
    },
    [MixedCheckboxStates.Mixed]: {
      entry: assignRefs,
      on: {
        [MixedCheckboxEvents.Toggle]: {
          target: MixedCheckboxStates.Checked,
          cond: checkToggleAllowed,
        },
        ...commonEvents,
      },
    },
  },
});

////////////////////////////////////////////////////////////////////////////////

/**
 * MixedCheckbox
 *
 * Tri-state checkbox that accepts `checked` values of `true`, `false` or
 * `"mixed"`.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#mixedcheckbox-1
 */
export const MixedCheckbox = forwardRef<
  HTMLInputElement,
  MixedCheckboxProps & { _componentName?: string }
>(function MixedCheckbox(
  { checked, defaultChecked, disabled, onChange, ...props },
  forwardedRef
) {
  let ownRef: MixedCheckboxInputRef = useRef(null);
  let ref = useForkedRef(forwardedRef, ownRef);
  let [inputProps] = useMixedCheckbox(
    ownRef,
    {
      onChange,
      checked,
      defaultChecked,
      disabled,
    },
    "MixedCheckbox"
  );

  useControlledSwitchWarning(checked, "checked", "MixedCheckbox");

  return (
    <input {...props} {...inputProps} data-reach-mixed-checkbox="" ref={ref} />
  );
});

export type MixedCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked"
> & {
  /**
   * Whether or not the checkbox is checked or in a `mixed` (indeterminate)
   * state.
   */
  checked?: MixedOrBool;
};

if (__DEV__) {
  MixedCheckbox.displayName = "MixedCheckbox";
  MixedCheckbox.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const]),
    ]),
    onChange: PropTypes.func,
  };
}

////////////////////////////////////////////////////////////////////////////////

type MixedCheckboxArgs = {
  checked?: MixedOrBool;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
};

export type UseMixedCheckboxProps = Required<
  Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    "checked" | "disabled" | "onChange" | "onClick" | "type"
  >
> & { "aria-checked": MixedOrBool };

/**
 * useMixedCheckbox
 *
 * React hook to create a tri-state checkbox that accepts `checked` values of
 * `true`, `false` or `"mixed"`.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#usemixedcheckbox
 *
 * @param ref
 * @param args
 */
export function useMixedCheckbox(
  ref: MixedCheckboxInputRef,
  args?: MixedCheckboxArgs,
  functionOrComponentName: string = "useMixedCheckbox"
): [UseMixedCheckboxProps, { checked: MixedOrBool }] {
  let {
    checked: controlledChecked,
    defaultChecked,
    disabled,
    onChange,
    onClick,
  } = args || {};

  let isControlled = controlledChecked != null;

  let machine = useCreateMachine(
    createMachineDefinition(
      checkedPropToStateValue(
        isControlled ? controlledChecked! : defaultChecked
      ),
      {
        disabled: !!disabled,
        isControlled,
      }
    )
  );

  let [current, send] = useMachineLogger(
    useMachine(machine, {
      input: ref,
    }),
    DEBUG
  );

  let props: UseMixedCheckboxProps = {
    "aria-checked": stateValueToAriaChecked(current.value),
    checked: stateValueToChecked(current.value),
    disabled: !!disabled,
    onChange: wrapEvent(onChange, handleChange),
    onClick: wrapEvent(onClick, handleClick),
    type: "checkbox",
  };

  let contextData = {
    checked: stateValueToAriaChecked(current.value),
  };

  function handleChange() {
    /*
     * If the component is not controlled by the app, we will send the toggle
     * event when the input change handler is called and let our state machine
     * dictate the next state. Othewise we'll call onChange directly and react
     * to any resulting state changes as a side effect.
     */
    if (!isControlled) {
      send(MixedCheckboxEvents.Toggle);
    }
  }

  function handleClick() {
    /*
     * A controlled checkbox will have a checked="mixed" prop, but the
     * underlying input element will receive checked="false" and
     * aria-checked="mixed". A user click will change the underlying
     * element's indeterminate property back to false even if the state
     * doesn't change. This does not trigger a re-render, so our check won't
     * work in a normal effect. We'll check again on every user click and
     * update the node imperatively if the state doesn't change.
     */
    syncDomNodeWithState();
  }

  function syncDomNodeWithState() {
    if (ref.current) {
      ref.current.indeterminate = current.value === MixedCheckboxStates.Mixed;
    }
  }

  useEffect(() => {
    if (__DEV__ && !ref.current) {
      throw new Error(
        `A ref was not assigned to an input element in ${functionOrComponentName}.`
      );
    }
  }, [ref, functionOrComponentName]);

  useEffect(() => {
    if (isControlled) {
      send({
        type: MixedCheckboxEvents.Set,
        state: checkedPropToStateValue(controlledChecked),
      });
    }
  }, [isControlled, controlledChecked, send]);

  // Prevent flashing before mixed marker is displayed and check on every render
  useIsomorphicLayoutEffect(syncDomNodeWithState);

  useEffect(() => {
    send({
      type: MixedCheckboxEvents.GetDerivedData,
      data: {
        disabled,
        isControlled,
      },
    });
  }, [disabled, isControlled, send]);

  return [props, contextData];
}

////////////////////////////////////////////////////////////////////////////////

/*
 * We want the API to be similar to the native DOM input API, so we opt for a
 * checked prop with a value of `true`, `false` or `"mixed"`.
 */

export function checkedPropToStateValue(checked?: MixedOrBool) {
  return checked === true
    ? MixedCheckboxStates.Checked
    : checked === "mixed"
    ? MixedCheckboxStates.Mixed
    : MixedCheckboxStates.Unchecked;
}

export function stateValueToAriaChecked(state: string): MixedOrBool {
  return state === MixedCheckboxStates.Checked
    ? true
    : state === MixedCheckboxStates.Mixed
    ? "mixed"
    : false;
}

export function stateValueToChecked(state: string) {
  return state === MixedCheckboxStates.Checked ? true : false;
}

// TODO: Move to @reach/utils
export function useControlledSwitchWarning(
  controlPropValue: any,
  controlPropName: string,
  componentName: string
) {
  /*
   * Determine whether or not the component is controlled and warn the developer
   * if this changes unexpectedly.
   */
  let isControlled = controlPropValue != null;
  let { current: wasControlled } = useRef(isControlled);
  useEffect(() => {
    if (__DEV__) {
      warning(
        !(!isControlled && wasControlled),
        `${componentName} is changing from controlled to uncontrolled. ${componentName} should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`${controlPropName}\` prop being passed in.`
      );
      warning(
        !(isControlled && !wasControlled),
        `${componentName} is changing from uncontrolled to controlled. ${componentName} should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`${controlPropName}\` prop being passed in.`
      );
    }
  }, [componentName, controlPropName, isControlled, wasControlled]);
}

////////////////////////////////////////////////////////////////////////////////
// Types

export type MixedOrBool = boolean | "mixed";

export interface MixedCheckboxData {
  disabled: boolean;
  isControlled: boolean;
  refs: MixedCheckboxNodeRefs;
}

/**
 * Shared partial interface for all of our event objects.
 */
interface MixedCheckboxEventBase extends MachineEventWithRefs {
  refs: MixedCheckboxNodeRefs;
}

/**
 * Event object for the checkbox state machine.
 */
export type MixedCheckboxEvent = MixedCheckboxEventBase &
  (
    | {
        type: MixedCheckboxEvents.Toggle;
      }
    | {
        type: MixedCheckboxEvents.Set;
        state: MixedCheckboxStates;
      }
    | {
        type: MixedCheckboxEvents.GetDerivedData;
        data: Partial<MixedCheckboxData>;
      }
  );

/**
 * State object for the checkbox state machine.
 */
export type MixedCheckboxState =
  | {
      value: MixedCheckboxStates.Checked;
      context: MixedCheckboxData;
    }
  | {
      value: MixedCheckboxStates.Unchecked;
      context: MixedCheckboxData;
    }
  | {
      value: MixedCheckboxStates.Mixed;
      context: MixedCheckboxData;
    };

/**
 * DOM nodes for all of the refs used in the mixed checkbox state machine.
 */
export type MixedCheckboxNodeRefs = {
  input: HTMLInputElement | null;
};

/**
 * Input element ref object.
 */
type MixedCheckboxInputRef = React.RefObject<MixedCheckboxNodeRefs["input"]>;
