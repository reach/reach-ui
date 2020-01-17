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
 * the box itself. As such, you must manage its state in your app by passing a
 * `checked` prop and an `onChange` handler.
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
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import {
  createNamedContext,
  wrapEvent,
  useForkedRef,
  useIsomorphicLayoutEffect,
  useConstant
} from "@reach/utils";
import {
  Typestate,
  createMachine as _createMachine,
  interpret,
  assign,
  StateMachine,
  EventObject as MachineEvent
} from "@xstate/fsm";
import PropTypes from "prop-types";
import warning from "warning";

/*
 * TODO: Revisit types and remove this
 * This is a hacky workaround to make the TS compiler happy and still get smart
 * type benefits when creating and using state machine events with our custom
 * useMahchine hook
 * https://stackoverflow.com/questions/59794474/omitting-a-shared-property-from-a-union-type-of-objects-results-in-error-when-us
 */
function createMachine<
  TC extends object,
  TE extends MachineEvent = MachineEvent,
  TR extends MachineEventWithRefs = MachineEventWithRefs,
  TS extends Typestate<TC> = any
>(cfg: StateMachine.Config<TC, TE & TR>) {
  return _createMachine<TC, TE & TR, TS>(cfg);
}

interface MachineEventWithRefs {
  refs: {
    [key: string]: any;
  };
}

////////////////////////////////////////////////////////////////////////////////
// States

enum CheckboxMachineStates {
  Unchecked = "UNCHECKED",
  Checked = "CHECKED",
  Mixed = "MIXED"
}

////////////////////////////////////////////////////////////////////////////////
// Events

enum CheckboxMachineEvents {
  Mount = "MOUNT",
  Toggle = "TOGGLE",
  Set = "SET",
  GetDerivedContext = "GET_DERIVED_STATE",
  Unmount = "UNMOUNT"
}

////////////////////////////////////////////////////////////////////////////////
// State machine

const checkToggleAllowed = (context: CheckboxMachineContext) =>
  !context.isControlled || !context.disabled;

const getCheckSetCondition = (state: string) => (
  context: CheckboxMachineContext,
  event: any
) => context.isControlled && !context.disabled && event.state === state;

const commonEvents = {
  [CheckboxMachineEvents.Mount]: {
    actions: assign(
      (
        context: CheckboxMachineContext,
        event: CheckboxMachineEvent & CheckboxRefsHack
      ) => {
        return {
          ...context,
          refs: event.refs
        };
      }
    )
  },
  [CheckboxMachineEvents.GetDerivedContext]: {
    target: CheckboxMachineStates.Checked,
    actions: assign((context: CheckboxMachineContext, event: any) => {
      return {
        ...context,
        ...event.context,
        refs: event.refs
      };
    })
  },
  [CheckboxMachineEvents.Set]: [
    {
      target: CheckboxMachineStates.Checked,
      cond: getCheckSetCondition(CheckboxMachineStates.Checked)
    },
    {
      target: CheckboxMachineStates.Unchecked,
      cond: getCheckSetCondition(CheckboxMachineStates.Unchecked)
    },
    {
      target: CheckboxMachineStates.Mixed,
      cond: getCheckSetCondition(CheckboxMachineStates.Mixed)
    }
  ]
};

export const checkboxMachine = createMachine<
  CheckboxMachineContext,
  CheckboxMachineEvent,
  CheckboxRefsHack,
  CheckboxMachineState
>({
  id: "checkbox",
  initial: [
    { target: CheckboxMachineStates.Checked, cond: ctx => !!ctx },
    { target: CheckboxMachineStates.Unchecked }
  ],
  states: {
    [CheckboxMachineStates.Unchecked]: {
      entry: assign((context, event) => {
        return {
          ...context
          //refs: event.refs
        };
      }),
      on: {
        [CheckboxMachineEvents.Toggle]: {
          target: CheckboxMachineStates.Checked,
          cond: checkToggleAllowed
        },
        ...commonEvents
      }
    },
    [CheckboxMachineStates.Checked]: {
      on: {
        [CheckboxMachineEvents.Toggle]: {
          target: CheckboxMachineStates.Unchecked,
          cond: checkToggleAllowed
        },
        ...commonEvents
      }
    },
    [CheckboxMachineStates.Mixed]: {
      on: {
        [CheckboxMachineEvents.Toggle]: {
          target: CheckboxMachineStates.Checked,
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

const mixedCheckboxPropTypes = {
  checked: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(["mixed" as const])
  ]),
  name: PropTypes.string,
  onChange: PropTypes.func
};

////////////////////////////////////////////////////////////////////////////////
// CustomCheckboxContainer

export const CustomCheckboxContainer = forwardRef<
  HTMLSpanElement,
  CustomCheckboxContainerProps
>(function CustomCheckboxContainer(
  { children, onClick, ...props },
  forwardedRef
) {
  const inputRef: InputRef = useRef(null);
  const [{ checked, disabled, focused }, setContainerState] = useState<
    CustomCheckboxContainerState
  >({
    checked: false,
    disabled: false,
    focused: false
  });

  function handleClick() {
    // Wait a frame so the input event is triggered, then focus the input
    window.requestAnimationFrame(() => {
      inputRef.current && inputRef.current.focus();
    });
  }

  let context: ICustomCheckboxContext = {
    inputRef,
    containerState: { checked, disabled, focused },
    setContainerState
  };

  return (
    <CustomCheckboxContext.Provider value={context}>
      <span
        {...props}
        ref={forwardedRef}
        data-reach-custom-checkbox-container=""
        data-checked={checked === true ? "" : undefined}
        data-focus={focused ? "" : undefined}
        data-mixed={checked === "mixed" ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onClick={wrapEvent(onClick, handleClick)}
      >
        {children}
      </span>
    </CustomCheckboxContext.Provider>
  );
});

type CustomCheckboxContainerState = {
  checked: boolean | "mixed";
  disabled: boolean;
  focused: boolean;
};

type CustomCheckboxContainerProps = React.HTMLAttributes<HTMLSpanElement> & {};

CustomCheckboxContainer.displayName = "CustomCheckboxContainer";
if (__DEV__) {
  CustomCheckboxContainer.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
// CustomCheckboxInput

type CustomCheckboxInputProps = MixedCheckboxProps & {};

export const CustomCheckboxInput = forwardRef<
  HTMLInputElement,
  CustomCheckboxInputProps & { _componentName?: string }
>(function CustomCheckboxInput(
  {
    _componentName = "CustomCheckboxInput",
    checked,
    disabled,
    onBlur,
    onChange,
    onFocus,
    ...props
  },
  forwardedRef
) {
  const { setContainerState, inputRef } = useCustomCheckboxContext();
  const [focused, setFocused] = useState(false);
  const ref = useForkedRef(forwardedRef, inputRef);
  const [inputProps] = useMixedCheckbox(
    inputRef,
    {
      checked,
      disabled,
      onChange
    },
    _componentName
  );

  // useLayoutEffect to prevent any flashing on the initial render sync
  useIsomorphicLayoutEffect(() => {
    setContainerState({
      checked: checked == null ? false : checked,
      disabled: Boolean(disabled),
      focused
    });
  }, [setContainerState, checked, focused, disabled]);

  return (
    <input
      ref={ref}
      data-reach-custom-checkbox-input=""
      disabled={disabled}
      onBlur={wrapEvent(onBlur, () => {
        window.requestAnimationFrame(() => setFocused(false));
      })}
      onFocus={wrapEvent(onFocus, () => {
        window.requestAnimationFrame(() => setFocused(true));
      })}
      {...props}
      {...inputProps}
    />
  );
});

CustomCheckboxInput.displayName = "CustomCheckboxInput";
if (__DEV__) {
  CustomCheckboxInput.propTypes = {
    ...mixedCheckboxPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////
// CustomCheckbox

type CustomCheckboxProps = MixedCheckboxProps & {};

export const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  function CustomCheckbox(
    { checked, disabled, children, id, name, onChange, value, ...props },
    forwardedRef
  ) {
    const inputProps = {
      checked,
      disabled,
      id,
      name,
      onChange,
      value
    };

    return (
      <CustomCheckboxContainer data-reach-custom-checkbox="" {...props}>
        <CustomCheckboxInput
          _componentName="CustomCheckbox"
          {...inputProps}
          ref={forwardedRef}
        />
        {children}
      </CustomCheckboxContainer>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";
if (__DEV__) {
  CustomCheckbox.propTypes = {
    ...mixedCheckboxPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////
// MixedCheckbox

export const MixedCheckbox = forwardRef<
  HTMLInputElement,
  MixedCheckboxProps & { _componentName?: string }
>(function MixedCheckbox(
  { _componentName = "MixedCheckbox", checked, disabled, onChange, ...props },
  forwardedRef
) {
  const ownRef = useRef(null);
  const ref = useForkedRef(forwardedRef, ownRef);

  const [inputProps] = useMixedCheckbox(
    ownRef,
    {
      checked,
      disabled,
      onChange
    },
    _componentName
  );

  return <input {...props} {...inputProps} ref={ref} />;
});

type MixedCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked"
> & {
  checked?: boolean | "mixed";
};

MixedCheckbox.displayName = "MixedCheckbox";
if (__DEV__) {
  MixedCheckbox.propTypes = {
    ...mixedCheckboxPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////
// useMixedCheckbox

export function useMixedCheckbox(
  ref: React.RefObject<any>,
  {
    checked: controlledChecked,
    defaultChecked,
    disabled,
    onChange
  }: {
    checked?: boolean | "mixed";
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?(event: React.FormEvent): void;
  },
  componentName = "MixedCheckbox"
): [React.InputHTMLAttributes<HTMLInputElement>, CheckboxReactRefs] {
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

  let initialState = useConstant(
    isControlled ? controlledChecked : Boolean(defaultChecked)
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  // TODO: Remove the type params when the ref hack problem is solved
  // These types should be inferred by the machine obj. once the ref hack thing
  // is fixed.
  const [current, send] = useMachine<
    CheckboxMachineContext,
    CheckboxMachineEvent,
    CheckboxRefsHack
  >(checkboxMachine, {
    input: inputRef
  });

  const mixed = checked === "mixed";
  const props = {
    "aria-checked": String(checked) as
      | boolean
      | "false"
      | "mixed"
      | "true"
      | undefined,
    "data-reach-mixed-checkbox": "",
    checked: checked === true,
    disabled,
    onChange: handleChange,
    type: "checkbox"
  };

  function handleChange(event: React.FormEvent) {
    if (!disabled) {
      onChange && onChange(event);
    }
  }

  useEffect(() => {
    if (!ref.current) {
      console.warn("The checkbox ref has not been attached.");
      return;
    }
    ref.current.indeterminate = mixed;
  }, [mixed, ref]);

  useEffect(() => {
    send({
      type: CheckboxMachineEvents.GetDerivedContext,
      context: {
        disabled,
        isControlled
      }
    });
  }, [disabled, isControlled, send]);

  return [props, { input: inputRef }];
}

////////////////////////////////////////////////////////////////////////////////
// useMachine

function useMachine<
  TC,
  TE extends MachineEvent = MachineEvent,
  TR extends MachineEventWithRefs = MachineEventWithRefs
>(
  stateMachine: StateMachine.Machine<TC, TE & TR, any>,
  refs: {
    [K in keyof TR["refs"]]: React.RefObject<TR["refs"][K]>;
  }
): [
  StateMachine.State<TC, TE & TR, any>,
  StateMachine.Service<TC, TE>["send"],
  StateMachine.Service<TC, TE & TR>
] {
  const { current: initialMachine } = useRef(stateMachine);
  if (__DEV__) {
    if (stateMachine !== initialMachine) {
      throw new Error(
        "Machine given to `useMachine` has changed between renders. This is not supported and might lead to unexpected results.\n" +
          "Please make sure that you pass the same Machine each time."
      );
    }
  }

  const service = useConstant(() => interpret(stateMachine).start());
  const [current, setCurrent] = useState(stateMachine.initialState);

  // Add refs to every event so we can use them to perform actions.
  const send = useCallback(
    (rawEvent: TE["type"] | TE) => {
      const event =
        typeof rawEvent === "string" ? ({ type: rawEvent } as TE) : rawEvent;
      const unwrapped = Object.keys(refs).reduce((unwrapped, name) => {
        (unwrapped as any)[name] = refs[name].current;
        return unwrapped;
      }, {});
      service.send({ ...event, refs: unwrapped } as TE & TR);
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
// Types

type InputRef = React.RefObject<HTMLElement | null>;

interface ICustomCheckboxContext {
  inputRef: InputRef;
  containerState: CustomCheckboxContainerState;
  setContainerState: React.Dispatch<
    React.SetStateAction<CustomCheckboxContainerState>
  >;
}

interface CheckboxMachineContext {
  disabled: boolean;
  isControlled: boolean;
  refs: CheckboxNodeRefs;
}

interface CheckboxRefsHack extends MachineEventWithRefs {
  refs: CheckboxNodeRefs;
}

type CheckboxNodeRefs = {
  input: HTMLInputElement | null;
};

type CheckboxReactRefs = {
  [K in keyof CheckboxNodeRefs]: React.RefObject<CheckboxNodeRefs[K]>;
};

type CheckboxMachineEvent =
  | { type: CheckboxMachineEvents.Toggle }
  | {
      type: CheckboxMachineEvents.Set;
      state: CheckboxMachineStates;
    }
  | {
      type: CheckboxMachineEvents.GetDerivedContext;
      context: Partial<CheckboxMachineContext>;
    };

type CheckboxMachineState =
  | {
      value: CheckboxMachineStates.Checked;
      context: CheckboxMachineContext;
    }
  | {
      value: CheckboxMachineStates.Unchecked;
      context: CheckboxMachineContext;
    }
  | {
      value: CheckboxMachineStates.Mixed;
      context: CheckboxMachineContext;
    };
