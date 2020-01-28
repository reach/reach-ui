/**
 * Welcome to @reach/checkbox!
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
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/checkbox/src/custom
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
  checkStyles,
  createNamedContext,
  useForkedRef,
  wrapEvent
} from "@reach/utils";
import {
  checkedPropToStateValue,
  MixedOrBool,
  useControlledSwitchWarning,
  useMixedCheckbox,
  UseMixedCheckboxProps
} from "./mixed";
import PropTypes from "prop-types";

////////////////////////////////////////////////////////////////////////////////

const CustomCheckboxContext = createNamedContext(
  "CustomCheckboxContext",
  {} as ICustomCheckboxContext
);
function useCustomCheckboxContext() {
  return useContext(CustomCheckboxContext);
}

////////////////////////////////////////////////////////////////////////////////

/**
 * CustomCheckboxContainer
 *
 * Wrapper component and context provider for a custom checkbox.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#customcheckboxcontainer
 */
export const CustomCheckboxContainer = forwardRef<
  HTMLSpanElement,
  CustomCheckboxContainerProps & { _componentName?: string }
>(function CustomCheckboxContainer(
  {
    checked: controlledChecked,
    children,
    defaultChecked,
    disabled,
    onClick,
    onChange,
    _componentName = "CustomCheckboxContainer",
    ...props
  },
  forwardedRef
) {
  let inputRef: CustomCheckboxInputRef = useRef(null);
  let [inputProps, stateData] = useMixedCheckbox(inputRef, {
    defaultChecked,
    checked: controlledChecked,
    disabled,
    onChange
  });
  let [focused, setFocused] = useState(false);

  function handleClick() {
    // Wait a frame so the input event is triggered, then focus the input
    window.requestAnimationFrame(() => {
      inputRef.current && inputRef.current.focus();
    });
  }

  let context: ICustomCheckboxContext = {
    defaultChecked,
    disabled,
    focused,
    inputProps,
    inputRef,
    setFocused
  };

  useControlledSwitchWarning(controlledChecked, "checked", _componentName);
  useEffect(() => checkStyles("custom-checkbox"), []);

  return (
    <CustomCheckboxContext.Provider value={context}>
      <span
        {...props}
        ref={forwardedRef}
        data-reach-custom-checkbox-container=""
        data-focused={focused ? "" : undefined}
        data-state={checkedPropToStateValue(stateData.checked)}
        onClick={wrapEvent(onClick, handleClick)}
      >
        {/* TODO: Typing for children func */}
        {typeof children === "function"
          ? children({
              checked: inputProps["aria-checked"],
              inputRef,
              focused
            })
          : children}
      </span>
    </CustomCheckboxContext.Provider>
  );
});

export type CustomCheckboxContainerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange"
> & {
  checked?: MixedOrBool;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
};

if (__DEV__) {
  CustomCheckboxContainer.displayName = "CustomCheckboxContainer";
  CustomCheckboxContainer.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const])
    ]),
    defaultChecked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func
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
>(function CustomCheckboxInput({ onBlur, onFocus, ...props }, forwardedRef) {
  let {
    focused,
    inputProps,
    inputRef,
    setFocused
  } = useCustomCheckboxContext();

  let ref = useForkedRef(forwardedRef, inputRef);

  let handleBlur = useCallback(() => {
    // window.requestAnimationFrame(() => send(CustomCheckboxEvents.Blur));
    window.requestAnimationFrame(() => {
      setFocused(false);
    });
  }, [setFocused]);

  let handleFocus = useCallback(() => {
    // window.requestAnimationFrame(() => send(CustomCheckboxEvents.Focus));
    window.requestAnimationFrame(() => {
      setFocused(true);
    });
  }, [setFocused]);

  return (
    <input
      {...props}
      {...inputProps}
      ref={ref}
      type="checkbox"
      data-reach-custom-checkbox-input=""
      data-focused={focused ? "" : undefined}
      onBlur={wrapEvent(onBlur, handleBlur)}
      onFocus={wrapEvent(onFocus, handleFocus)}
    />
  );
});

export type CustomCheckboxInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "disabled" | "onChange"
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
    { children, id, name, value, ...props },
    forwardedRef
  ) {
    return (
      <CustomCheckboxContainer
        {...props}
        data-reach-custom-checkbox=""
        _componentName="CustomCheckbox"
      >
        <CustomCheckboxInput
          id={id}
          name={name}
          ref={forwardedRef}
          value={value}
        />
        {children}
      </CustomCheckboxContainer>
    );
  }
);

export type CustomCheckboxProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange"
> & {
  checked?: MixedOrBool;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: React.InputHTMLAttributes<HTMLInputElement>["name"];
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
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
// Types

/**
 * Context object for our custom checkbox wrapper.
 */
interface ICustomCheckboxContext {
  // checked: MixedOrBool;
  defaultChecked: boolean | undefined;
  disabled: boolean | undefined;
  focused: boolean;
  inputProps: UseMixedCheckboxProps;
  inputRef: CustomCheckboxInputRef;
  // onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  setFocused: React.Dispatch<React.SetStateAction<boolean>>;
}

type CustomCheckboxInputRef = React.RefObject<HTMLInputElement | null>;
