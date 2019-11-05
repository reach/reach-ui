////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/checkbox!

import React, {
  forwardRef,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { wrapEvent, useForkedRef } from "@reach/utils";
import warning from "warning";
import { string, bool, func, oneOfType, node, shape } from "prop-types";

const CustomCheckboxContext = createContext({});
const useCustomCheckboxContext = () => useContext(CustomCheckboxContext);

////////////////////////////////////////////////////////////////////////////////
export const CustomCheckboxContainer = forwardRef(
  function CustomCheckboxContainer({ children, ...props }, forwardedRef) {
    const [
      { checked, disabled, readOnly, focused },
      setContainerState
    ] = useState({
      checked: null,
      disabled: null,
      readOnly: null,
      focused: null
    });
    const mixed = checked === "mixed";
    return (
      <CustomCheckboxContext.Provider
        value={{
          containerState: { checked, disabled, readOnly, focused },
          setContainerState
        }}
      >
        <div
          ref={forwardedRef}
          {...props}
          data-reach-custom-checkbox-container=""
          data-checked={checked === true ? "" : undefined}
          data-focus={focused ? "" : undefined}
          data-mixed={mixed ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          data-read-only={readOnly ? "" : undefined}
        >
          {typeof children === "function" ? children({ checked }) : children}
        </div>
      </CustomCheckboxContext.Provider>
    );
  }
);

if (__DEV__) {
  CustomCheckboxContainer.displayName = "CustomCheckboxContainer";
}

////////////////////////////////////////////////////////////////////////////////
export const CustomCheckboxInput = forwardRef(function CustomCheckboxInput(
  {
    checked: controlledChecked,
    defaultChecked,
    name,
    onBlur,
    onChange,
    onFocus,
    readOnly,
    ...props
  },
  forwardedRef
) {
  const [focused, setFocused] = useState(false);
  const ownRef = useRef(null);
  const ref = useForkedRef(forwardedRef, ownRef);
  const { setContainerState } = useCustomCheckboxContext();
  const [inputProps, { checked }] = useMixedCheckbox(ownRef, {
    checked: controlledChecked,
    defaultChecked,
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
      onBlur={wrapEvent(onBlur, () => setFocused(false))}
      onFocus={wrapEvent(onFocus, () => setFocused(true))}
      {...props}
      {...inputProps}
    />
  );
});

if (__DEV__) {
  CustomCheckboxInput.displayName = "CustomCheckboxInput";
}

////////////////////////////////////////////////////////////////////////////////
export const CustomCheckbox = forwardRef(function CustomCheckbox(
  {
    checked: controlledChecked,
    defaultChecked,
    disabled,
    checkmarks,
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
    checked: controlledChecked,
    defaultChecked,
    disabled,
    id,
    name,
    onChange,
    readOnly,
    value
  };

  return (
    <CustomCheckboxContainer
      data-reach-custom-checkbox=""
      data-custom-checkmarks={checkmarks != null ? "" : undefined}
      {...props}
    >
      {({ checked }) => (
        <>
          <CustomCheckboxInput ref={forwardedRef} {...inputProps} />
          {checked === true && checkmarks && checkmarks.true}
          {checked === false && checkmarks && checkmarks.false}
          {checked === "mixed" && checkmarks && checkmarks.mixed}
          {children}
        </>
      )}
    </CustomCheckboxContainer>
  );
});

if (__DEV__) {
  CustomCheckbox.propTypes = {
    checkmarks: shape({
      true: node,
      false: node,
      mixed: node
    })
  };
  CustomCheckbox.displayName = "CustomCheckbox";
}

////////////////////////////////////////////////////////////////////////////////
export const MixedCheckbox = forwardRef(function MixedCheckbox(
  { checked: controlledChecked, defaultChecked, onChange, readOnly, ...props },
  forwardedRef
) {
  const ownRef = useRef(null);
  const ref = useForkedRef(forwardedRef, ownRef);

  const [inputProps] = useMixedCheckbox(ownRef, {
    checked: controlledChecked,
    defaultChecked,
    onChange,
    readOnly
  });

  return <input {...props} {...inputProps} ref={ref} />;
});

if (__DEV__) {
  MixedCheckbox.propTypes = {
    checked: oneOfType([bool, string]),
    defaultChecked: oneOfType([bool, string]),
    onChange: func
  };
  MixedCheckbox.displayName = "MixedCheckbox";
}

////////////////////////////////////////////////////////////////////////////////
export function useMixedCheckbox(
  ref,
  { checked: controlledChecked, defaultChecked, onChange, readOnly }
) {
  const { current: isControlled } = React.useRef(controlledChecked != null);
  const [checkedState, setCheckedState] = React.useState(
    Boolean(defaultChecked)
  );
  const checked = isControlled ? controlledChecked : checkedState;
  const mixed = checked === "mixed";
  const state = { checked };
  const props = {
    "aria-checked": mixed ? "mixed" : String(checked),
    "data-reach-mixed-checkbox": "",
    checked: mixed || checked,
    readOnly,
    onChange: wrapEvent(onChange, handleChange),
    type: "checkbox"
  };

  function handleChange(event) {
    const { checked: targetChecked } = event.target;
    if (readOnly) {
      event.preventDefault();
    } else if (!isControlled) {
      setCheckedState(targetChecked);
    }
  }

  if (__DEV__) {
    checkboxErrorChecks({
      isControlled,
      controlledChecked,
      defaultChecked
    });
  }

  useEffect(() => {
    if (!ref.current) {
      console.warn("The checkbox ref has not been attached.");
      return;
    }
    ref.current.indeterminate = mixed;
    ref.current.checked = checked === true ? true : false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixed, checked]);

  return [props, state];
}

////////////////////////////////////////////////////////////////////////////////
const controlledPropWarning = `A checkbox should not switch from controlled to uncontrolled (or vice versa). Decide between controlled or uncontrolled for the lifetime of the component. Check the \`checked\` prop.`;

function checkboxErrorChecks({
  isControlled,
  controlledChecked,
  defaultChecked
}) {
  warning(
    !(isControlled && defaultChecked != null),
    `A checkbox component contains both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://fb.me/react-controlled-components}`
  );

  warning(
    !(isControlled && controlledChecked == null),
    `A checkbox is changing from controlled to uncontrolled. ${controlledPropWarning}`
  );

  warning(
    !(!isControlled && controlledChecked != null),
    `A checkbox is changing from uncontrolled to controlled. ${controlledPropWarning}`
  );
}
