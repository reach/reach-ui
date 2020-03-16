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
 * TODO: Consider using pseudo boxes instead of native input for events
 *       The main benefit here is that we won't need to fight the browser for
 *       focus, which will make it easier for apps to manage focus without
 *       hacky workarounds like setTimeout.
 *       This will probably yield a new API, as HTML labels won't work
 *       seamlessly with this change. We would also no longer need to expose a
 *       fully hidden input field directly that only exists holds a value for
 *       forms.
 *
 *       <CustomCheckbox> // provider only, no wrapper
 *         <CustomCheckboxInput /> // pseudo box + hidden input
 *         <CustomCheckboxLabel /> // aria-label with click handler
 *       </CustomCheckbox>
 *
 * @see Docs     https://reacttraining.com/reach-ui/checkbox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/checkbox/src/custom
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#checkbox
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  checkStyles,
  createNamedContext,
  isFunction,
  useForkedRef,
  wrapEvent,
} from "@reach/utils";
import {
  checkedPropToStateValue,
  MixedOrBool,
  useControlledSwitchWarning,
  useMixedCheckbox,
  UseMixedCheckboxProps,
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
    onChange,
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
    setFocused,
  };

  useControlledSwitchWarning(controlledChecked, "checked", _componentName);
  useEffect(() => checkStyles("checkbox"), []);

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
        {isFunction(children)
          ? children({
              checked: inputProps["aria-checked"],
              inputRef,
              focused,
            })
          : children}
      </span>
    </CustomCheckboxContext.Provider>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkboxcontainer-props
 */
export type CustomCheckboxContainerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange"
> & {
  /**
   * Whether or not the checkbox is checked or in a `mixed` (indeterminate)
   * state.
   *
   * This prop is assigned to the `CustomCheckboxContainer` and passed to
   * the `CustomCheckboxInput` via the React Context API.
   *
   * @see https://reactjs.org/docs/context.html
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkboxcontainer-checked
   *
   */
  checked?: MixedOrBool;
  /**
   * A `CustomCheckboxContainer` can accept a React node or render prop function
   * as its child. It should always have one `CustomCheckboxInput` component as
   * a descendant.
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkboxcontainer-children
   */
  children: React.ReactNode | CustomCheckboxContainerChildRender;
  /**
   * For uncontrolled checkbox components, `defaultChecked` dictates whether or
   * not the default initial state for a checkbox is `checked`.
   *
   * Because any checkbox with a `mixed` state must be controlled by the app,
   * `defaultChecked` only accepts `true` or `false` values.
   *
   * This prop is assigned to the `CustomCheckboxContainer` and passed to
   * the `CustomCheckboxInput` via the React Context API.
   *
   * @see https://reactjs.org/docs/context.html
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-defaultchecked
   */
  defaultChecked?: boolean;
  /**
   * Whether or not the checkbox form input is disabled.
   *
   * This prop is assigned to the `CustomCheckboxContainer` and passed to
   * the `CustomCheckboxInput` via the React Context API.
   *
   * @see https://reactjs.org/docs/context.html
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-disabled
   */
  disabled?: boolean;
  /**
   * The callback that is fired when the checkbox value is changed.
   *
   * @param event
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-onchange
   *
   */
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
};

if (__DEV__) {
  CustomCheckboxContainer.displayName = "CustomCheckboxContainer";
  CustomCheckboxContainer.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const]),
    ]),
    defaultChecked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * CustomCheckboxInput
 *
 * Component to render the HTML input element for our custom checkbox. The
 * rendered element should be visually hidden and exists only to manage its
 * state and hold a form name and value.
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
    setFocused,
  } = useCustomCheckboxContext();

  let ref = useForkedRef(forwardedRef, inputRef);

  function handleBlur() {
    // window.requestAnimationFrame(() => send(CustomCheckboxEvents.Blur));
    window.requestAnimationFrame(() => {
      setFocused(false);
    });
  }

  function handleFocus() {
    // window.requestAnimationFrame(() => send(CustomCheckboxEvents.Focus));
    window.requestAnimationFrame(() => {
      setFocused(true);
    });
  }

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
 * A checkbox component with a wrapper element for custom styling.
 *
 * @see Docs https://reacttraining.com/reach-ui/checkbox#customcheckbox-1
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

/**
 * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-props
 */
export type CustomCheckboxProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange"
> & {
  /**
   * Whether or not the checkbox is checked or in a `mixed` (indeterminate)
   * state.
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-checked
   */
  checked?: MixedOrBool;
  /**
   * A `CustomCheckbox` can accept any React node as children so long as the
   * rendered content is valid HTML. It is best to avoid adding interactive
   * elements inside of a `CustomCheckbox`
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-children
   */
  children?: React.ReactNode;
  /**
   * For uncontrolled checkbox components, `defaultChecked` dictates whether or
   * not the default initial state for a checkbox is `checked`.
   *
   * Because any checkbox with a `mixed` state must be controlled by the app,
   * `defaultChecked` only accepts `true` or `false` values.
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-defaultchecked
   */
  defaultChecked?: boolean;
  /**
   * Whether or not the checkbox form input is disabled.
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-disabled
   */
  disabled?: boolean;
  /**
   * The `name` attribute passed to the checkbox form input.
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-name
   */
  name?: React.InputHTMLAttributes<HTMLInputElement>["name"];
  /**
   * The callback that is fired when the checkbox value is changed.
   *
   * @param event
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-onchange
   */
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  /**
   * The `value` attribute passed to the checkbox form input.
   *
   * @see Docs https://reacttraining.com/reach-ui/checkbox#custom-checkbox-value
   */
  value?: React.InputHTMLAttributes<HTMLInputElement>["value"];
};

if (__DEV__) {
  CustomCheckbox.displayName = "CustomCheckbox";
  CustomCheckbox.propTypes = {
    checked: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(["mixed" as const]),
    ]),
    disabled: PropTypes.bool,
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string,
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

type CustomCheckboxContainerChildRender = (args: {
  checked: boolean | "mixed";
  inputRef: CustomCheckboxInputRef;
  focused: boolean;
}) => React.ReactElement<any>;
