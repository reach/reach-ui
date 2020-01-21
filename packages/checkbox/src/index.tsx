/**
 * Welcome to @reach/checkbox!
 *
 * This package is provides two top-level components:
 *   - MixedCheckbox
 *   - CustomCheckbox
 *
 * A MixedCheckbox is a tri-state HTML input element. Whereas the native element
 * technically only has two states, there is a third visual state of
 * `indeterminate` that is designed to suggest that a user has fulfilled some
 * part of whatever the checkbox is meant to control. For example, you may have
 * multiple checkboxes nested in a hierarchy like a checklist that looks like:
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
 * have some other ideas that call for a custom solution.
 *
 * A CustomCheckbox is useful because full control of a native HTML input's
 * design is not always possible. You may want to provide custom check graphics
 * or change the shape of the check or its color. This component provides a
 * handy wrapper around a visually hidden native checkbox so that we avoid
 * re-creating all of its native event behavior.
 *
 * CustomCheckbox uses our MixedCheckbox so you get the same benefits for
 * dealing with indeterminate state when you use either!
 *
 * @see Docs     https://reacttraining.com/reach-ui/checkbox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/checkbox
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#checkbox
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  createNamedContext,
  DistributiveOmit,
  useConstant,
  useForkedRef,
  useIsomorphicLayoutEffect,
  wrapEvent
} from "@reach/utils";
import {
  assign,
  createMachine,
  EventObject as MachineEvent,
  interpret,
  StateMachine
} from "@xstate/fsm";
import PropTypes from "prop-types";
import warning from "warning";

////////////////////////////////////////////////////////////////////////////////
// States

enum CheckboxStates {
  Checked = "checked",
  Mixed = "mixed",
  Unchecked = "unchecked"
}

////////////////////////////////////////////////////////////////////////////////
// Events

enum CheckboxEvents {
  Blur = "BLUR",
  Focus = "FOCUS",
  GetDerivedContext = "GET_DERIVED_STATE",
  Mount = "MOUNT",
  Set = "SET",
  Toggle = "TOGGLE",
  Unmount = "UNMOUNT"
}

////////////////////////////////////////////////////////////////////////////////
// Actions & Conditions

/**
 * Toggle events will only update state if the checkbox component is
 * uncontrolled and not disabled.
 *
 * @param context
 */
function checkToggleAllowed(data: CheckboxData) {
  return data ? !data.isControlled || !data.disabled : false;
}

/**
 * Set events will update state if the checkbox component is controlled and
 * the state target state matches the state passed in the event.
 *
 * @param state
 */
function getCheckSetCondition(state: string) {
  return function(data: CheckboxData, event: any) {
    return data && data.isControlled && event.state === state;
  };
}

/**
 * Assign refs to the machine's context data
 */
const assignRefs = assign((data: CheckboxData, event: CheckboxEvent) => {
  return {
    ...data,
    refs: event.refs
  };
});

////////////////////////////////////////////////////////////////////////////////
// State Machine

const commonEvents = {
  [CheckboxEvents.Blur]: {
    actions: [assignRefs, assign({ focused: false })]
  },
  [CheckboxEvents.Focus]: {
    actions: [assignRefs, assign({ focused: true })]
  },
  [CheckboxEvents.Mount]: {
    actions: assignRefs
  },
  [CheckboxEvents.GetDerivedContext]: {
    actions: [
      assignRefs,
      assign((data: CheckboxData, event: any) => {
        return {
          ...data,
          ...event.data
        };
      })
    ]
  },
  [CheckboxEvents.Set]: [
    {
      target: CheckboxStates.Checked,
      cond: getCheckSetCondition(CheckboxStates.Checked)
    },
    {
      target: CheckboxStates.Unchecked,
      cond: getCheckSetCondition(CheckboxStates.Unchecked)
    },
    {
      target: CheckboxStates.Mixed,
      cond: getCheckSetCondition(CheckboxStates.Mixed)
    }
  ]
};

/**
 * Initializer for our state machine.
 *
 * @param initial
 * @param props
 */
export const createCheckboxMachine = (
  initial: CheckboxStates,
  props: {
    disabled: boolean;
    isControlled: boolean;
  }
) =>
  createMachine<CheckboxData, CheckboxEvent, CheckboxState>({
    id: "checkbox",
    initial,
    context: {
      focused: false,
      disabled: props.disabled,
      isControlled: props.isControlled,
      refs: {
        input: null
      }
    },
    states: {
      [CheckboxStates.Unchecked]: {
        entry: assignRefs,
        on: {
          [CheckboxEvents.Toggle]: {
            target: CheckboxStates.Checked,
            cond: checkToggleAllowed
          },
          ...commonEvents
        }
      },
      [CheckboxStates.Checked]: {
        entry: assignRefs,
        on: {
          [CheckboxEvents.Toggle]: {
            target: CheckboxStates.Unchecked,
            cond: checkToggleAllowed
          },
          ...commonEvents
        }
      },
      [CheckboxStates.Mixed]: {
        entry: assignRefs,
        on: {
          [CheckboxEvents.Toggle]: {
            target: CheckboxStates.Checked,
            cond: checkToggleAllowed
          },
          ...commonEvents
        }
      }
    }
  });

////////////////////////////////////////////////////////////////////////////////

const CustomCheckboxContext = createNamedContext(
  "CustomCheckboxContext",
  {} as ICustomCheckboxContext
);
const useCustomCheckboxContext = () => useContext(CustomCheckboxContext);

////////////////////////////////////////////////////////////////////////////////

/**
 * CustomCheckboxContainer
 *
 * Wrapper component and context provider for our custom checkbox.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#customcheckboxcontainer
 */
export const CustomCheckboxContainer = forwardRef<
  HTMLSpanElement,
  CustomCheckboxContainerProps & { _componentName?: string }
>(function CustomCheckboxContainer(
  {
    _componentName = "CustomCheckboxContainer",
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    onClick,
    ...props
  },
  forwardedRef
) {
  const inputRef: InputRef = useRef(null);

  function handleClick() {
    // Wait a frame so the input event is triggered, then focus the input
    window.requestAnimationFrame(() => {
      inputRef.current && inputRef.current.focus();
    });
  }

  const [inputProps, outputRef, { focused, checked }] = useMixedCheckbox(
    inputRef,
    {
      checked: checkedProp,
      defaultChecked,
      disabled,
      componentName: _componentName
    }
  );

  let assignmentRef = useForkedRef(forwardedRef, outputRef);

  let context: ICustomCheckboxContext = {
    checked,
    focused,
    inputRef,
    inputProps,
    assignmentRef
  };

  return (
    <CustomCheckboxContext.Provider value={context}>
      <span
        {...props}
        ref={forwardedRef}
        data-reach-custom-checkbox-container=""
        data-state={checkedPropToStateValue(checked)}
        data-disabled={disabled || undefined}
        data-focused={focused || undefined}
        onClick={wrapEvent(onClick, handleClick)}
      >
        {/* TODO: Typing for children func */}
        {typeof children === "function"
          ? children({
              ref: assignmentRef,
              inputProps,
              checked,
              focused
            })
          : children}
      </span>
    </CustomCheckboxContext.Provider>
  );
});

type CustomCheckboxContainerProps = React.HTMLAttributes<HTMLSpanElement> & {
  checked?: CheckState;
  defaultChecked?: boolean;
  disabled?: boolean;
};

if (__DEV__) {
  CustomCheckboxContainer.displayName = "CustomCheckboxContainer";
  CustomCheckboxContainer.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const])
    ]),
    defaultChecked: PropTypes.bool,
    disabled: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * CustomCheckboxInput
 *
 * Component to render the HTML input element for our custom checkbox.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#customcheckboxinput
 */
export const CustomCheckboxInput = forwardRef<
  HTMLInputElement,
  CustomCheckboxInputProps
>(function CustomCheckboxInput(
  { onBlur, onChange, onFocus, ...props },
  forwardedRef
) {
  const { inputProps, assignmentRef } = useCustomCheckboxContext();
  const ref = useForkedRef(forwardedRef, assignmentRef);
  return (
    <input
      {...props}
      {...inputProps}
      ref={ref}
      data-reach-custom-checkbox-input=""
      onBlur={wrapEvent(onBlur, inputProps.onBlur!)}
      onChange={wrapEvent(onChange, inputProps.onChange!)}
      onFocus={wrapEvent(onFocus, inputProps.onFocus!)}
    />
  );
});

type CustomCheckboxInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "disabled"
> & {};

if (__DEV__) {
  CustomCheckboxInput.displayName = "CustomCheckboxInput";
  CustomCheckboxInput.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * CustomCheckbox
 *
 * Custom checkbox component.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#customcheckbox
 */
export const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  function CustomCheckbox(
    {
      checked,
      children,
      defaultChecked,
      disabled,
      id,
      name,
      onChange,
      value,
      ...props
    },
    forwardedRef
  ) {
    return (
      <CustomCheckboxContainer
        {...props}
        data-reach-custom-checkbox=""
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        _componentName="CustomCheckbox"
      >
        <CustomCheckboxInput
          id={id}
          name={name}
          ref={forwardedRef}
          value={value}
          onChange={onChange}
        />
        {children}
      </CustomCheckboxContainer>
    );
  }
);

type CustomCheckboxProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange"
> & {
  checked?: CheckState;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: React.InputHTMLAttributes<HTMLInputElement>["name"];
  onChange?(event: React.FormEvent): void;
  value?: React.InputHTMLAttributes<HTMLInputElement>["value"];
};

if (__DEV__) {
  CustomCheckbox.displayName = "CustomCheckbox";
  CustomCheckbox.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const])
    ]),
    disabled: PropTypes.bool,
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * MixedCheckbox
 *
 * Tri-state checkbox that accepts `checked` values of `true`, `false` or
 * `"mixed"`.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#mixedcheckbox
 */
export const MixedCheckbox = forwardRef<
  HTMLInputElement,
  MixedCheckboxProps & { _componentName?: string }
>(function MixedCheckbox(
  { checked, defaultChecked, disabled, onBlur, onChange, onFocus, ...props },
  forwardedRef
) {
  const ownRef: InputRef = useRef(null);
  const [inputProps, outputRef] = useMixedCheckbox(ownRef, {
    checked,
    defaultChecked,
    disabled
  });
  const ref = useForkedRef(forwardedRef, outputRef);

  return (
    <input
      {...props}
      {...inputProps}
      ref={ref}
      onBlur={wrapEvent(onBlur, inputProps.onBlur!)}
      onChange={wrapEvent(onChange, inputProps.onChange!)}
      onFocus={wrapEvent(onFocus, inputProps.onFocus!)}
    />
  );
});

type MixedCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked"
> & {
  checked?: CheckState;
};

if (__DEV__) {
  MixedCheckbox.displayName = "MixedCheckbox";
  MixedCheckbox.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const])
    ]),
    name: PropTypes.string,
    onChange: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////

type MixedCheckboxArgs = {
  checked?: CheckState;
  defaultChecked?: boolean;
  disabled?: boolean;
  componentName?: string;
};

type MixedCheckboxData = {
  checked: CheckState;
  focused: boolean;
};

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
  ref: InputRef,
  args?: MixedCheckboxArgs
): [
  React.InputHTMLAttributes<HTMLInputElement>,
  React.Ref<any>,
  MixedCheckboxData
] {
  const {
    checked: controlledChecked,
    defaultChecked,
    disabled,
    componentName = "MixedCheckbox"
  } = args || {};

  /*
   * Determine whether or not the component is controlled and warn the developer
   * if this changes unexpectedly.
   */
  const isControlled = controlledChecked != null;
  const { current: wasControlled } = useRef(isControlled);
  useEffect(() => {
    if (__DEV__) {
      warning(
        !(!isControlled && wasControlled),
        `${componentName} is changing from controlled to uncontrolled. ${componentName} should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`checked\` prop being passed in.`
      );
      warning(
        !(isControlled && !wasControlled),
        `${componentName} is changing from uncontrolled to controlled. ${componentName} should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`checked\` prop being passed in.`
      );
    }
  }, [componentName, isControlled, wasControlled]);

  let initialState = useConstant(() =>
    checkedPropToStateValue(isControlled ? controlledChecked : defaultChecked)
  );
  let inputRef = useRef<HTMLInputElement | null>(null);

  let machine = useConstant(() =>
    createCheckboxMachine(initialState, {
      disabled: !!disabled,
      isControlled
    })
  );
  let [current, send] = useMachine(machine, {
    input: inputRef
  });

  const handleBlur = useCallback(() => {
    window.requestAnimationFrame(() => send(CheckboxEvents.Blur));
  }, [send]);

  const handleFocus = useCallback(() => {
    window.requestAnimationFrame(() => send(CheckboxEvents.Focus));
  }, [send]);

  useEffect(() => {
    console.log("send updated, bad!");
  }, [send]);

  const props = {
    "aria-checked": stateValueToAriaChecked(current.value),
    "data-reach-mixed-checkbox": "",
    checked: stateValueToChecked(current.value),
    disabled,
    onBlur: handleBlur,
    onChange: handleChange,
    onFocus: handleFocus,
    type: "checkbox"
  };

  const contextData = {
    focused: current.context.focused,
    checked: stateValueToAriaChecked(current.value)
  };

  let mergedRef: React.Ref<any> = useForkedRef(ref, inputRef);

  function handleChange() {
    /*
     * If the component is not controlled by the app, we will send the toggle
     * event when the input change handler is called and let our state machine
     * dictate the next state. Othewise we'll call onChange directly and react
     * to any resulting state changes as a side effect.
     */
    if (!isControlled) {
      send(CheckboxEvents.Toggle);
    }
  }

  useEffect(() => {
    if (isControlled) {
      send({
        type: CheckboxEvents.Set,
        state: checkedPropToStateValue(controlledChecked)
      });
    }
  }, [isControlled, controlledChecked, send]);

  // Prevent flashing before mixed marker is displayed
  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = current.value === CheckboxStates.Mixed;
    }
  }, [current.value, ref]);

  useEffect(() => {
    send({
      type: CheckboxEvents.GetDerivedContext,
      data: {
        disabled,
        isControlled
      }
    });
  }, [disabled, isControlled, send]);

  return [props, mergedRef, contextData];
}

////////////////////////////////////////////////////////////////////////////////
// useMachine

/**
 * This `useMachine` works very similiarly to what you get from `@xstate/react`
 * with some additions.
 *  - A second argument `refs` is passed to send all of our refs into our
 *    machine's contextual data object.
 *  - We wrap the `send` function so that refs are updated included in all of
 *    our events so we can use their current value (generally DOM nodes)
 *    anywhere in our actions.
 *  - We initialize the machine inside the component rather than throwing an
 *    error if an outside initializer creates a value that doesn't match. This
 *    is useful as some components may need a different initial state or some
 *    initial data based on props. We should *generally* just update the state
 *    with an event via useEffect and depend on a static initial value, but this
 *    is difficuly if that initial value matters for SSR or to prevent some
 *    layout jank on the first paint. I don't think there's with this approach,
 *    but we'll see what happens.
 *
 * @param initialMachine
 * @param refs
 */
function useMachine<TC, TE extends MachineEventWithRefs = MachineEventWithRefs>(
  initialMachine: StateMachine.Machine<TC, TE, any>,
  refs: ReactRefs<TE>
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
  const { current: machine } = useRef(initialMachine);
  const service = useConstant(() => interpret(machine).start());
  const [current, setCurrent] = useState(machine.initialState);

  // Add refs to every event so we can use them to perform actions.
  const send = useCallback(
    (rawEvent: TE["type"] | DistributiveOmit<TE, "refs">) => {
      const event =
        typeof rawEvent === "string" ? { type: rawEvent } : rawEvent;
      const refValues = Object.keys(refs).reduce((value, name) => {
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

////////////////////////////////////////////////////////////////////////////////

/*
 * We want the API to be similar to the native DOM input API, so we opt for a
 * checked prop with a value of `true`, `false` or `"mixed"`.
 */

function checkedPropToStateValue(checked?: CheckState) {
  return checked === true
    ? CheckboxStates.Checked
    : checked === "mixed"
    ? CheckboxStates.Mixed
    : CheckboxStates.Unchecked;
}

function stateValueToAriaChecked(state: string): CheckState {
  return state === CheckboxStates.Checked
    ? true
    : state === CheckboxStates.Mixed
    ? "mixed"
    : false;
}

function stateValueToChecked(state: string) {
  return state === CheckboxStates.Checked ? true : false;
}

////////////////////////////////////////////////////////////////////////////////
// Types

/**
 * Context object for our custom checkbox wrapper.
 */
interface ICustomCheckboxContext {
  checked: CheckState;
  focused: boolean;
  inputRef: InputRef;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  assignmentRef: React.Ref<any>;
}

/**
 * Events use in our `useMachine` always have a refs object and will inherit
 * this interface.
 */
interface MachineEventWithRefs extends MachineEvent {
  refs: {
    [key: string]: any;
  };
}

type ReactRefs<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

type CheckState = boolean | "mixed";

/**
 * Context data object for the checkbox state machine.
 */
interface CheckboxData {
  focused: boolean;
  disabled: boolean;
  isControlled: boolean;
  refs: CheckboxNodeRefs;
}

/**
 * DOM nodes for all of the refs used in the checkbox state machine.
 */
type CheckboxNodeRefs = {
  input: HTMLInputElement | null;
};

/**
 * Input element ref object.
 */
type InputRef = React.RefObject<CheckboxNodeRefs["input"]>;

/**
 * Shared partial interface for all of our event objects.
 */
interface CheckboxEventBase extends MachineEventWithRefs {
  refs: CheckboxNodeRefs;
}

/**
 * Event object for the checkbox state machine.
 */
type CheckboxEvent = CheckboxEventBase &
  (
    | {
        type: CheckboxEvents.Focus;
      }
    | {
        type: CheckboxEvents.Blur;
      }
    | {
        type: CheckboxEvents.Toggle;
      }
    | {
        type: CheckboxEvents.Set;
        state: CheckboxStates;
      }
    | {
        type: CheckboxEvents.GetDerivedContext;
        data: Partial<CheckboxData>;
      }
  );

/**
 * State object for the checkbox state machine.
 */
type CheckboxState =
  | {
      value: CheckboxStates.Checked;
      context: CheckboxData;
    }
  | {
      value: CheckboxStates.Unchecked;
      context: CheckboxData;
    }
  | {
      value: CheckboxStates.Mixed;
      context: CheckboxData;
    };
