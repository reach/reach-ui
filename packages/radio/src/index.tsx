/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  Fragment,
  useMemo,
} from "react";
import {
  checkStyles,
  createNamedContext,
  DistributiveOmit,
  forwardRefWithAs,
  getElementComputedStyle,
  getOwnerDocument,
  useIsomorphicLayoutEffect as useLayoutEffect,
  wrapEvent,
  useForkedRef,
  makeId,
} from "@reach/utils";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendants,
} from "@reach/descendants";
import { StateMachine } from "@xstate/fsm";
import { useId } from "@reach/auto-id";
import {
  createRadioMachine,
  RadioGroupData,
  RadioGroupEvent,
  RadioGroupEvents,
  useMachine,
} from "./machine";

const RadioDescendantsContext = createDescendantContext<
  HTMLElement,
  RadioDescendantProps
>("RadioDescendantsContext");
const RadioGroupContext = createNamedContext(
  "RadioGroupContext",
  {} as RadioGroupContextValue
);
const useRadioGroupContext = () => useContext(RadioGroupContext);

////////////////////////////////////////////////////////////////////////////////

/**
 * RadioGroup
 *
 * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup
 */
export const RadioGroup = forwardRefWithAs<RadioGroupProps, "div">(
  function RadioGroup(
    {
      as: Comp = "div",
      children,
      defaultValue,
      disabled,
      value: valueProp,
      name,
      onChange,
      ...props
    },
    forwardedRef
  ) {
    let { current: isControlled } = useRef(typeof valueProp !== "undefined");
    let [radioOptions, setRadioOptions] = useDescendants<
      HTMLElement,
      RadioDescendantProps
    >();
    let ownRef = useRef<HTMLElement>(null);
    let ref = useForkedRef(forwardedRef, ownRef);

    let [current, send] = useMachine(
      createRadioMachine({
        isControlled,
        value: isControlled
          ? (valueProp as RadioValue | null)
          : defaultValue || null,
      }),
      {}
    );

    // We need to know if the language mode is RTL to reverse
    // ArrowLeft/ArrowRight behavior in the state machine.
    let [isRTL, setIsRTL] = useState(false);

    let context: RadioGroupContextValue = {
      disabled: !!disabled,
      isControlled,
      isRTL,
      name,
      onChange,
      send,
      state: current,
      value: current.context.value,
    };

    if (isControlled && current.context.value !== valueProp) {
      // If the component is controlled, we'll sync state machine with the
      // controlled state from props
      send({
        type: RadioGroupEvents.SetValue,
        value: valueProp as RadioValue | null,
        callback: onChange,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
      let doc = getOwnerDocument(ownRef.current!)!;
      // TODO: Should probably listen for changes in a mutation observer
      setIsRTL(() => {
        if (
          doc.dir === "rtl" ||
          getElementComputedStyle(ownRef.current!, "direction") === "rtl"
        ) {
          return true;
        }
        return false;
      });
    }, []);

    useEffect(() => checkStyles("radio"), []);

    return (
      <DescendantProvider
        context={RadioDescendantsContext}
        items={radioOptions}
        set={setRadioOptions}
      >
        <RadioGroupContext.Provider value={context}>
          <Comp
            role="radiogroup"
            {...props}
            ref={ref}
            data-reach-radio-group=""
          >
            {children}
          </Comp>
        </RadioGroupContext.Provider>
      </DescendantProvider>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-props
 */
export type RadioGroupProps = {
  /**
   * Like form inputs, a radio group's state can be controlled by the owner.
   * Make sure to include an `onChange` as well, or else the radio group will
   * not be interactive.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-value
   */
  value?: RadioValue | null;
  /**
   * The default selected value for an uncontrolled radio group component.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-defaultvalue
   */
  defaultValue?: RadioValue;
  /**
   * Whether or not all radio buttons in a group should be disabled.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-disabled
   */
  disabled?: boolean;
  /**
   * The `name` attribute passed to a hidden form input.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-name
   */
  name?: React.InputHTMLAttributes<HTMLInputElement>["name"];
  /**
   * Calls back with the value whenever the user changes the active radio
   * button.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  onChange?: RadioChangeHandler;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Radio
 *
 * @see Docs https://reacttraining.com/reach-ui/radio#radio-1
 */
export const Radio = forwardRefWithAs<RadioProps, "span">(function Radio(
  {
    as: Comp = "span",
    children,
    onBlur,
    onClick,
    onFocus,
    onKeyDown,
    disabled: disabledProp,
    readOnly,
    value,
    ...props
  },
  forwardedRef
) {
  let {
    disabled: groupDisabled,
    isRTL,
    name,
    onChange,
    send,
    value: groupValue,
  } = useRadioGroupContext();
  let { descendants: radioOptions } = useContext(RadioDescendantsContext);

  let disabled = groupDisabled || !!disabledProp;

  let ownRef = useRef<HTMLElement | null>(null);
  let ref = useForkedRef(forwardedRef, ownRef);

  let inputRef = useRef<HTMLInputElement | null>(null);

  let focusableOptions = useMemo(
    () => radioOptions.filter(option => option.element && !option.disabled),
    [radioOptions]
  );

  let isSelected = value === groupValue;

  // A radio button is only tabbable if it is either selected OR if no buttons
  // are selected and it the first focusable option in our list.
  let isTabbable =
    isSelected ||
    (groupValue === null &&
      focusableOptions[0] &&
      focusableOptions[0].element === ownRef.current);

  let _id = useId(props.id);
  let id = props.id ?? makeId("radio", value, _id);
  let labelId = makeId("label", id);

  function handleClick(event: React.MouseEvent) {
    send({
      type: RadioGroupEvents.Select,
      callback: onChange,
      disabled,
      domEvent: event.nativeEvent,
      node: ownRef.current,
      value,
    });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    send({
      type: RadioGroupEvents.KeyDown,
      callback: onChange,
      disabled,
      domEvent: event.nativeEvent,
      isRTL,
      key: event.key,
      options: focusableOptions,
      value,
    });
  }

  function handleBlur() {
    send({ type: RadioGroupEvents.Blur });
  }

  function handleFocus() {
    send({ type: RadioGroupEvents.Focus, value });
  }

  useDescendant({
    context: RadioDescendantsContext,
    disabled,
    element: ownRef.current!,
    inputNode: inputRef.current,
    value,
  });

  return (
    <Fragment>
      <Comp
        aria-checked={isSelected}
        aria-disabled={disabled}
        aria-labelledby={children ? labelId : undefined}
        role="radio"
        {...props}
        data-reach-radio=""
        data-disabled={disabled ? "" : undefined}
        ref={ref}
        id={id}
        onBlur={wrapEvent(onBlur, handleBlur)}
        onClick={wrapEvent(onClick, handleClick)}
        onFocus={wrapEvent(onFocus, handleFocus)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        tabIndex={isTabbable ? 0 : -1}
      />
      {children && (
        <span
          id={labelId}
          data-reach-radio-label=""
          onClick={wrapEvent(onClick, event => {
            event.preventDefault();
            handleClick(event);
          })}
        >
          {children}
        </span>
      )}
      {name && (
        <input
          ref={inputRef}
          checked={isSelected}
          data-checked={isSelected}
          hidden
          name={name}
          onChange={event => {
            event.preventDefault();
            send({
              type: RadioGroupEvents.SetValue,
              value,
              callback: onChange,
            });
          }}
          readOnly
          type="radio"
          value={value}
        />
      )}
    </Fragment>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/radio#radio-props
 */
export type RadioProps = {
  /**
   * Whether or not the radio button is disabled.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radio-disabled
   */
  disabled?: boolean;
  /**
   * Whether or not the radio button is read-only. The button will still be
   * focusabled but not selectable.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radio-readonly
   */
  readOnly?: boolean;
  /**
   * The `value` attribute for the radio selection.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radio-value
   */
  value: RadioValue;
};

////////////////////////////////////////////////////////////////////////////////
// Types

export type RadioValue = string;

export type RadioChangeHandler = (value: RadioValue) => void;

export type RadioDescendantProps = {
  disabled: boolean;
  inputNode: HTMLInputElement | null;
  value: RadioValue;
};

interface RadioGroupContextValue {
  disabled: boolean;
  state: StateMachine.State<RadioGroupData, RadioGroupEvent, any>;
  isControlled: boolean;
  isRTL: boolean;
  name: string | undefined;
  onChange: RadioChangeHandler | undefined;
  value: RadioValue | null;
  send: StateMachine.Service<
    RadioGroupData,
    DistributiveOmit<RadioGroupEvent, "refs">
  >["send"];
}
