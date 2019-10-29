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
import { wrapEvent, assignRef } from "@reach/utils";
import warning from "warning";
import { any, string, bool, func, oneOfType, node, shape } from "prop-types";

const CustomCheckboxContext = createContext({});
const useCheckboxContext = () => useContext(CustomCheckboxContext);

////////////////////////////////////////////////////////////////////////////////
export const CustomCheckboxContainer = forwardRef(
  function CustomCheckboxContainer({ children, ...props }, forwardedRef) {
    const [
      { checked, mixed, disabled, readOnly, focused },
      setContainerState
    ] = useState({
      checked: null,
      mixed: null,
      disabled: null,
      readOnly: null,
      focused: null
    });

    return (
      <CustomCheckboxContext.Provider
        value={{ setContainerState, visuallyHidden: true }}
      >
        <div
          ref={forwardedRef}
          {...props}
          data-reach-custom-checkbox-container=""
          data-checked={checked ? "" : undefined}
          data-focus={focused ? "" : undefined}
          data-mixed={mixed ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          data-read-only={readOnly ? "" : undefined}
        >
          {children}
        </div>
      </CustomCheckboxContext.Provider>
    );
  }
);

////////////////////////////////////////////////////////////////////////////////
export const CustomCheckbox = forwardRef(function CustomCheckbox(
  {
    checked: controlledChecked,
    defaultChecked,
    disabled: disabledProp,
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
  const [inputProps, { checked }] = useMixedCheckbox({
    checked: controlledChecked,
    defaultChecked,
    disabled: disabledProp,
    onChange,
    readOnly
  });
  return (
    <CustomCheckboxContainer
      data-reach-custom-checkbox=""
      {...props}
      ref={forwardedRef}
    >
      {checked === true && checkmarks.true}
      {checked === false && checkmarks.false}
      {checked === "mixed" && checkmarks.mixed}
      {children}
      <MixedCheckbox
        id={id}
        value={value}
        name={name}
        readOnly={readOnly}
        {...inputProps}
      />
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
  {
    checked: controlledChecked,
    defaultChecked,
    disabled: disabledProp,
    name,
    onBlur,
    onChange,
    onFocus,
    readOnly,
    ...props
  },
  forwardedRef
) {
  const { setContainerState, visuallyHidden } = useCheckboxContext();
  const [
    inputProps,
    { focused, checked, disabled, mixed, isControlled }
  ] = useMixedCheckbox({
    checked: controlledChecked,
    defaultChecked,
    disabled: disabledProp,
    onBlur,
    onChange,
    onFocus,
    readOnly
  });

  const ownRef = useRef(null);
  const ref = useForkedRef(forwardedRef, ownRef);

  useEffect(() => {
    ownRef.current.indeterminate = mixed;
    ownRef.current.checked = checked === true ? true : false;
  }, [mixed, checked]);

  useEffect(() => {
    if (setContainerState) {
      setContainerState({ checked, mixed, disabled, readOnly, focused });
    }
  }, [setContainerState, checked, disabled, mixed, readOnly, focused]);

  if (__DEV__) {
    checkboxErrorChecks({
      isControlled,
      controlledChecked,
      defaultChecked
    });
  }

  return (
    <input
      {...props}
      {...inputProps}
      ref={ref}
      data-reach-mixed-checkbox=""
      data-reach-mixed-checkbox-hidden={visuallyHidden && ""}
      name={name}
      readOnly={readOnly}
      type="checkbox"
    />
  );
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
export function useMixedCheckbox({
  checked: controlledChecked,
  defaultChecked,
  disabled,
  onBlur,
  onChange,
  onFocus,
  readOnly
}) {
  const { current: isControlled } = React.useRef(controlledChecked != null);
  const [focused, setFocused] = useState(false);
  const [checkedState, setCheckedState] = React.useState(
    Boolean(defaultChecked)
  );
  const checked = isControlled ? controlledChecked : checkedState;
  const mixed = checked === "mixed";

  function handleChange(event) {
    const { checked: targetChecked } = event.target;

    if (readOnly) {
      event.preventDefault();
    }

    if (!isControlled) {
      setCheckedState(targetChecked);
    }
  }

  const props = {
    "aria-checked": mixed ? "mixed" : String(checked),
    checked,
    defaultChecked,
    disabled,
    onBlur: wrapEvent(onBlur, () => setFocused(false)),
    onFocus: wrapEvent(onFocus, () => setFocused(true)),
    onChange: wrapEvent(onChange, handleChange)
  };
  const state = { focused, checked, disabled, mixed, isControlled };

  return [props, state];
}

////////////////////////////////////////////////////////////////////////////////
const getControlledPropWarning = (prop, component) =>
  `${component} should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ${component} for the lifetime of the component. Check the \`${prop}\` prop being passed in.`;

function checkboxErrorChecks({ isControlled, controlledChecked }) {
  const component = "MixedCheckbox";
  warning(
    !(isControlled && controlledChecked == null),
    `${component} is changing from controlled to uncontrolled. ${getControlledPropWarning(
      "checked",
      component
    )}`
  );

  warning(
    !(!isControlled && controlledChecked != null),
    `${component} is changing from uncontrolled to controlled. ${getControlledPropWarning(
      "checked",
      component
    )}`
  );
}

function useForkedRef(...refs) {
  return React.useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null;
    }
    return node => {
      refs.forEach(ref => {
        assignRef(ref, node);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
