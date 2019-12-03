////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/checkbox!

/*
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
 */

import React, {
  forwardRef,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { wrapEvent, useForkedRef } from "@reach/utils";
import PropTypes from "prop-types";

const CustomCheckboxContext = createContext({});
const useCustomCheckboxContext = () => useContext(CustomCheckboxContext);

const inputPropTypes = {
  checked: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  name: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool
};

////////////////////////////////////////////////////////////////////////////////
// CustomCheckboxContainer

export const CustomCheckboxContainer = forwardRef(
  function CustomCheckboxContainer(
    { children, onClick, ...props },
    forwardedRef
  ) {
    const inputRef = useRef(null);
    const [
      { checked, disabled, readOnly, focused },
      setContainerState
    ] = useState({
      checked: null,
      disabled: null,
      readOnly: null,
      focused: null
    });

    function handleClick() {
      // Wait a frame so the input event is triggered, then focus the input
      window.requestAnimationFrame(() => {
        inputRef.current && inputRef.current.focus();
      });
    }

    return (
      <CustomCheckboxContext.Provider
        value={{
          inputRef,
          containerState: { checked, disabled, readOnly, focused },
          setContainerState
        }}
      >
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
  }
);

CustomCheckboxContainer.displayName = "CustomCheckboxContainer";

////////////////////////////////////////////////////////////////////////////////
// CustomCheckboxInput

export const CustomCheckboxInput = forwardRef(function CustomCheckboxInput(
  { checked, onBlur, onChange, onFocus, readOnly, ...props },
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

  useEffect(() => {
    if (setContainerState) {
      setContainerState({
        checked,
        disabled: props.disabled,
        readOnly,
        focused
      });
    }
  }, [setContainerState, checked, readOnly, focused, props.disabled]);

  return (
    <input
      ref={ref}
      data-reach-custom-checkbox-input=""
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
    ...inputPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////
// CustomCheckbox

export const CustomCheckbox = forwardRef(function CustomCheckbox(
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
});

CustomCheckbox.displayName = "CustomCheckbox";
if (__DEV__) {
  CustomCheckbox.propTypes = {
    ...inputPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////
// MixedCheckbox

export const MixedCheckbox = forwardRef(function MixedCheckbox(
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
});

MixedCheckbox.displayName = "MixedCheckbox";
if (__DEV__) {
  MixedCheckbox.propTypes = {
    ...inputPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////
// useMixedCheckbox

export function useMixedCheckbox(ref, { checked, onChange, readOnly }) {
  const mixed = checked === "mixed";
  const props = {
    "aria-checked": String(checked),
    "data-reach-mixed-checkbox": "",
    checked: checked === true,
    readOnly,
    onChange: handleChange,
    type: "checkbox"
  };

  function handleChange(event) {
    if (readOnly) {
      event.preventDefault();
    } else {
      onChange(event);
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
