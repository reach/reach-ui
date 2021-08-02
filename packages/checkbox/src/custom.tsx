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
 * @see Docs     https://reach.tech/checkbox
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/checkbox/src/custom
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#checkbox
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */

import * as React from "react";
import { createNamedContext } from "@reach/utils/context";
import { isFunction } from "@reach/utils/type-check";
import { useCheckStyles } from "@reach/utils/dev-utils";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";
import {
  internal_checkedPropToStateValue as checkedPropToStateValue,
  internal_useControlledSwitchWarning as useControlledSwitchWarning,
  useMixedCheckbox,
} from "./mixed";
import PropTypes from "prop-types";

import type * as Polymorphic from "@reach/utils/polymorphic";
import type { MixedOrBool, UseMixedCheckboxProps } from "./mixed";

////////////////////////////////////////////////////////////////////////////////

const CustomCheckboxContext = createNamedContext(
  "CustomCheckboxContext",
  {} as CustomCheckboxContextValue
);
function useCustomCheckboxContext() {
  return React.useContext(CustomCheckboxContext);
}

////////////////////////////////////////////////////////////////////////////////

/**
 * CustomCheckboxContainer
 *
 * Wrapper component and context provider for a custom checkbox.
 *
 * @see Docs https://reach.tech/checkbox#customcheckboxcontainer
 */
const CustomCheckboxContainer = React.forwardRef(
  function CustomCheckboxContainer(
    {
      as: Comp = "span",
      checked: controlledChecked,
      children,
      defaultChecked,
      disabled,
      onClick,
      onChange,
      // @ts-expect-error
      __componentName = "CustomCheckboxContainer",
      ...props
    },
    forwardedRef
  ) {
    let inputRef: CustomCheckboxInputRef = React.useRef(null);
    let [inputProps, stateData] = useMixedCheckbox(
      inputRef,
      {
        defaultChecked,
        checked: controlledChecked,
        disabled,
        onChange,
      },
      __componentName
    );
    let [focused, setFocused] = React.useState(false);

    function handleClick() {
      // Wait a frame so the input event is triggered, then focus the input
      window.requestAnimationFrame(() => {
        inputRef.current && inputRef.current.focus();
      });
    }

    let context: CustomCheckboxContextValue = {
      defaultChecked,
      disabled,
      focused,
      inputProps,
      inputRef,
      setFocused,
    };

    useControlledSwitchWarning(controlledChecked, "checked", __componentName);
    useCheckStyles("checkbox");

    return (
      <CustomCheckboxContext.Provider value={context}>
        <Comp
          {...props}
          ref={forwardedRef}
          data-reach-custom-checkbox-container=""
          data-focused={focused ? "" : undefined}
          data-state={checkedPropToStateValue(stateData.checked)}
          onClick={composeEventHandlers(onClick, handleClick)}
        >
          {isFunction(children)
            ? children({
                checked: inputProps["aria-checked"],
                inputRef,
                focused,
              })
            : children}
        </Comp>
      </CustomCheckboxContext.Provider>
    );
  }
) as Polymorphic.ForwardRefComponent<"span", CustomCheckboxContainerProps>;

/**
 * @see Docs https://reach.tech/checkbox#custom-checkboxcontainer-props
 */
interface CustomCheckboxContainerProps {
  /**
   * Whether or not the checkbox is checked or in a `mixed` (indeterminate)
   * state.
   *
   * This prop is assigned to the `CustomCheckboxContainer` and passed to
   * the `CustomCheckboxInput` via the React Context API.
   *
   * @see https://reactjs.org/docs/context.html
   * @see Docs https://reach.tech/checkbox#custom-checkboxcontainer-checked
   *
   */
  checked?: MixedOrBool;
  /**
   * A `CustomCheckboxContainer` can accept a React node or render prop function
   * as its child. It should always have one `CustomCheckboxInput` component as
   * a descendant.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkboxcontainer-children
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
   * @see Docs https://reach.tech/checkbox#custom-checkbox-defaultchecked
   */
  defaultChecked?: boolean;
  /**
   * Whether or not the checkbox form input is disabled.
   *
   * This prop is assigned to the `CustomCheckboxContainer` and passed to
   * the `CustomCheckboxInput` via the React Context API.
   *
   * @see https://reactjs.org/docs/context.html
   * @see Docs https://reach.tech/checkbox#custom-checkbox-disabled
   */
  disabled?: boolean;
  /**
   * The callback that is fired when the checkbox value is changed.
   *
   * @param event
   * @see Docs https://reach.tech/checkbox#custom-checkbox-onchange
   *
   */
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
}

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
 * @see Docs https://reach.tech/checkbox#customcheckboxinput
 */
const CustomCheckboxInput = React.forwardRef(function CustomCheckboxInput(
  { as: Comp = "input", onBlur, onFocus, ...props },
  forwardedRef
) {
  let { focused, inputProps, inputRef, setFocused } =
    useCustomCheckboxContext();

  let ref = useComposedRefs(forwardedRef, inputRef);
  let mounted = React.useRef(true);

  function handleBlur() {
    // window.requestAnimationFrame(() => send(CustomCheckboxEvents.Blur));
    window.requestAnimationFrame(() => {
      if (mounted.current) {
        setFocused(false);
      }
    });
  }

  function handleFocus() {
    // window.requestAnimationFrame(() => send(CustomCheckboxEvents.Focus));
    window.requestAnimationFrame(() => {
      if (mounted.current) {
        setFocused(true);
      }
    });
  }

  React.useEffect(() => () => void (mounted.current = false), []);

  return (
    <Comp
      {...props}
      {...inputProps}
      ref={ref}
      type="checkbox"
      data-reach-custom-checkbox-input=""
      data-focused={focused ? "" : undefined}
      onBlur={composeEventHandlers(onBlur, handleBlur)}
      onFocus={composeEventHandlers(onFocus, handleFocus)}
    />
  );
}) as Polymorphic.ForwardRefComponent<"input", CustomCheckboxInputProps>;

interface CustomCheckboxInputProps {
  /**
   * The `name` attribute passed to the checkbox form input.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-name
   */
  name?: React.ComponentProps<"input">["name"];
  /**
   * The `value` attribute passed to the checkbox form input.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-value
   */
  value?: React.ComponentProps<"input">["value"];
}

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
 * @see Docs https://reach.tech/checkbox#customcheckbox-1
 */
const CustomCheckbox = React.forwardRef(function CustomCheckbox(
  { children, id, name, value, ...props },
  forwardedRef
) {
  return (
    <CustomCheckboxContainer
      {...props}
      data-reach-custom-checkbox=""
      // @ts-ignore
      __componentName="CustomCheckbox"
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
}) as Polymorphic.ForwardRefComponent<"input", CustomCheckboxProps>;

/**
 * @see Docs https://reach.tech/checkbox#custom-checkbox-props
 */
interface CustomCheckboxProps {
  /**
   * Whether or not the checkbox is checked or in a `mixed` (indeterminate)
   * state.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-checked
   */
  checked?: MixedOrBool;
  /**
   * A `CustomCheckbox` can accept any React node as children so long as the
   * rendered content is valid HTML. It is best to avoid adding interactive
   * elements inside of a `CustomCheckbox`
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-children
   */
  children?: React.ReactNode;
  /**
   * For uncontrolled checkbox components, `defaultChecked` dictates whether or
   * not the default initial state for a checkbox is `checked`.
   *
   * Because any checkbox with a `mixed` state must be controlled by the app,
   * `defaultChecked` only accepts `true` or `false` values.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-defaultchecked
   */
  defaultChecked?: boolean;
  /**
   * Whether or not the checkbox form input is disabled.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-disabled
   */
  disabled?: boolean;
  /**
   * The `name` attribute passed to the checkbox form input.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-name
   */
  name?: React.ComponentProps<"input">["name"];
  /**
   * The callback that is fired when the checkbox value is changed.
   *
   * @param event
   * @see Docs https://reach.tech/checkbox#custom-checkbox-onchange
   */
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  /**
   * The `value` attribute passed to the checkbox form input.
   *
   * @see Docs https://reach.tech/checkbox#custom-checkbox-value
   */
  value?: React.ComponentProps<"input">["value"];
}

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
interface CustomCheckboxContextValue {
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

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  CustomCheckboxContainerProps,
  CustomCheckboxInputProps,
  CustomCheckboxProps,
};
export { CustomCheckbox, CustomCheckboxContainer, CustomCheckboxInput };
