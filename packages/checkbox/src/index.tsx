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
  useState
} from "react";
import {
  createNamedContext,
  wrapEvent,
  useForkedRef,
  useIsomorphicLayoutEffect
} from "@reach/utils";
import PropTypes from "prop-types";

const CustomCheckboxContext = createNamedContext(
  "CustomCheckboxContext",
  {} as ICustomCheckboxContext
);
const useCustomCheckboxContext = () => useContext(CustomCheckboxContext);

const mixedCheckboxPropTypes = {
  /*
   * For some reason, the `checked` prop type causes TS to error because it
   * interprets "mixed" as type `string` rather than assuming this is a valid
   * union type. Both of the below fail.
   *
   * Type 'string' is not assignable to type 'boolean | "mixed" | null | undefined
   */
  // checked: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(["mixed"])]),
  // checked: PropTypes.oneOf([true, false, "mixed"]),
  name: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool
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
  const [
    { checked, disabled, readOnly, focused },
    setContainerState
  ] = useState<CustomCheckboxContainerState>({
    checked: false,
    disabled: false,
    readOnly: false,
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
    containerState: { checked, disabled, readOnly, focused },
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
        data-read-only={readOnly ? "" : undefined}
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
  readOnly: boolean;
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
  CustomCheckboxInputProps
>(function CustomCheckboxInput(
  { checked, disabled, onBlur, onChange, onFocus, readOnly, ...props },
  forwardedRef
) {
  const { setContainerState, inputRef } = useCustomCheckboxContext();
  const [focused, setFocused] = useState(false);
  const ref = useForkedRef(forwardedRef, inputRef);
  const [inputProps] = useMixedCheckbox(inputRef, {
    checked,
    onChange,
    readOnly
  });

  // useLayoutEffect to prevent any flashing on the initial render sync
  useIsomorphicLayoutEffect(() => {
    setContainerState({
      checked: checked == null ? false : checked,
      disabled: Boolean(disabled),
      readOnly: Boolean(readOnly),
      focused
    });
  }, [setContainerState, checked, readOnly, focused, disabled]);

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
    {
      checked,
      disabled,
      children,
      id,
      name,
      onChange,
      readOnly,
      value,
      ...props
    },
    forwardedRef
  ) {
    const inputProps = {
      checked,
      disabled,
      id,
      name,
      onChange,
      readOnly,
      value
    };

    return (
      <CustomCheckboxContainer data-reach-custom-checkbox="" {...props}>
        <CustomCheckboxInput ref={forwardedRef} {...inputProps} />
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

export const MixedCheckbox = forwardRef<HTMLInputElement, MixedCheckboxProps>(
  function MixedCheckbox(
    { checked, onChange, readOnly, ...props },
    forwardedRef
  ) {
    const ownRef = useRef(null);
    const ref = useForkedRef(forwardedRef, ownRef);

    const [inputProps] = useMixedCheckbox(ownRef, {
      checked,
      onChange,
      readOnly
    });

    return <input {...props} {...inputProps} ref={ref} />;
  }
);

type MixedCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked"
> & {
  checked?: boolean | "mixed";
  readOnly?: boolean;
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
    checked,
    onChange,
    readOnly
  }: {
    checked?: boolean | "mixed";
    onChange?(event: React.FormEvent): void;
    readOnly?: boolean;
  }
) {
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
    readOnly,
    onChange: handleChange,
    type: "checkbox"
  };

  function handleChange(event: React.FormEvent) {
    if (readOnly) {
      event.preventDefault();
    } else {
      onChange && onChange(event);
    }
  }

  useEffect(() => {
    if (!ref.current) {
      console.warn("The checkbox ref has not been attached.");
      return;
    }
    ref.current.indeterminate = mixed;
    // We know ref is, indeed, a ref, so we can ignore the warning here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixed, checked]);

  return [props];
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
