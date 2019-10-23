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
import { useId } from "@reach/auto-id";
import warning from "warning";
import {
  any,
  string,
  bool,
  func,
  oneOfType,
  node,
  object,
  element,
  shape
} from "prop-types";

const CustomCheckboxContext = createContext({});
const CheckboxGroupContext = createContext({});
const useCheckboxContext = () => useContext(CustomCheckboxContext);
const useGroupContext = () => useContext(CheckboxGroupContext);

////////////////////////////////////////////////////////////////////////////////
export const CustomCheckboxContainer = React.forwardRef(
  function CustomCheckboxContainer({ children, ...props }, forwardedRef) {
    const [
      { checked, mixed, disabled, readOnly, focused },
      _setContainerState
    ] = useState({
      checked: null,
      mixed: null,
      disabled: null,
      readOnly: null,
      focused: null
    });

    return (
      <CustomCheckboxContext.Provider
        value={{ _setContainerState, _hidden: true }}
      >
        <div
          ref={forwardedRef}
          {...props}
          data-reach-custom-checkbox-container=""
          data-checked={checked ? "" : undefined}
          data-focused={focused ? "" : undefined}
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
export const CustomCheckbox = React.forwardRef(function CustomCheckbox(
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
export const MixedCheckbox = React.forwardRef(function MixedCheckbox(
  {
    checked: controlledChecked,
    defaultChecked,
    disabled: disabledProp,
    name: nameProp,
    onBlur,
    onChange,
    onFocus,
    readOnly,
    ...props
  },
  forwardedRef
) {
  const { groupId, name: groupName } = useGroupContext();
  const { _setContainerState, _hidden } = useCheckboxContext();
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
  const name = groupName || nameProp;

  useEffect(() => {
    ownRef.current.indeterminate = mixed;
    ownRef.current.checked = checked === true ? true : false;
  }, [mixed, checked]);

  useEffect(() => {
    if (_setContainerState) {
      _setContainerState({ checked, mixed, disabled, readOnly, focused });
    }
  }, [_setContainerState, checked, disabled, mixed, readOnly, focused]);

  if (__DEV__) {
    checkboxErrorChecks({
      isControlled,
      controlledChecked,
      groupId,
      defaultChecked
    });
  }

  return (
    <input
      {...props}
      {...inputProps}
      ref={ref}
      data-reach-mixed-checkbox=""
      data-reach-mixed-checkbox-hidden={_hidden && ""}
      name={name}
      readOnly={readOnly}
      type="checkbox"
    />
  );
});

if (__DEV__) {
  MixedCheckbox.propTypes = {
    checked: oneOfType([bool, string]),
    defaultChecked: bool,
    disabled: bool,
    name: string,
    onChange: func,
    value: any.isRequired
  };
  MixedCheckbox.displayName = "MixedCheckbox";
}

////////////////////////////////////////////////////////////////////////////////
export const CheckboxGroup = forwardRef(function CheckboxGroup(
  {
    children,
    id: idProp,
    checkedStates: controlledcheckedStates,
    onChange: onChangeProp,
    defaultCheckedStates, // uncotrolled starting states { value: state }
    legend,
    as: Comp = "fieldset",
    name: nameProp
  },
  forwardedRef
) {
  const controlledRef = useRef(controlledcheckedStates != null);
  const { current: inControlledGroup } = controlledRef;
  const [_checkedStates, setCheckedStates] = useState(
    defaultCheckedStates || {}
  );
  const checkedStates = inControlledGroup
    ? controlledcheckedStates
    : _checkedStates;
  const name = nameProp || kebabCase(legend);
  const fallbackId = makeId("checkbox-group", useId());
  const id = idProp || fallbackId;

  if (__DEV__) {
    checkboxGroupErrorChecks({
      inControlledGroup,
      controlledcheckedStates
    });
  }

  const onChange = wrapEvent(onChangeProp, event => {
    const { checked, value } = event.target;
    if (!inControlledGroup) {
      setCheckedStates({ ...checkedStates, [value]: Boolean(checked) });
    }
  });

  return (
    <CheckboxGroupContext.Provider
      value={{
        groupId: id,
        legend,
        name,
        checkedStates,
        onChange
      }}
      ref={forwardedRef}
    >
      <Comp data-reach-checkbox-group role="group" id={id}>
        {legend && <legend>{legend}</legend>}
        {typeof children === "function"
          ? children({ checkedStates })
          : children}
      </Comp>
    </CheckboxGroupContext.Provider>
  );
});

if (__DEV__) {
  CheckboxGroup.propTypes = {
    children: oneOfType([node, func]),
    checkedStates: object,
    onChange: func,
    defaultCheckedStates: object,
    legend: string,
    as: oneOfType([element, string]),
    name: string.isRequired
  };
  CheckboxGroup.displayName = "CheckboxGroup";
}

////////////////////////////////////////////////////////////////////////////////
export function useMixedCheckbox({
  checked: controlledChecked,
  defaultChecked,
  disabled: disabledProp,
  onBlur,
  onChange,
  onFocus,
  readOnly
}) {
  const {
    disabled: disabledGroup,
    onChange: groupOnChange
  } = useGroupContext();
  const { current: isControlled } = React.useRef(controlledChecked != null);
  const [focused, setFocused] = useState(false);
  const [checkedState, setCheckedState] = React.useState(
    Boolean(defaultChecked)
  );
  const disabled = disabledProp || disabledGroup;
  const checked = isControlled ? controlledChecked : checkedState;
  const mixed = checked === "mixed";

  function handleChange(event) {
    const { checked: targetChecked } = event.target;

    if (groupOnChange) {
      groupOnChange(event);
      return;
    }

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

function checkboxGroupErrorChecks({
  inControlledGroup,
  controlledcheckedStates
}) {
  warning(
    !(inControlledGroup && controlledcheckedStates == null),
    `Checkbox is nested inside a controlled CheckboxGroup, and the group is changing from controlled to uncontrolled. ${getControlledPropWarning(
      "checkedStates",
      "CheckboxGroup"
    )}`
  );

  warning(
    !(!inControlledGroup && controlledcheckedStates != null),
    `Checkbox is nested inside a controlled CheckboxGroup, and the group is changing from uncontrolled to controlled. ${getControlledPropWarning(
      "checkedStates",
      "CheckboxGroup"
    )}`
  );
}

function checkboxErrorChecks({
  isControlled,
  controlledChecked,
  defaultChecked,
  groupId
}) {
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

  warning(
    !(groupId && defaultChecked),
    `Grouped ${component} components must handle state in the parent CheckboxGroup component. It looks like you're trying to set an defaultChecked prop on a nested ${component} component. This is likely to result in errors and could cause your app to crash.
    To set the initial state of uncontrolled grouped checkboxes, use the \`defaultCheckedStates\` prop on the CheckboxGroup. See https://reacttraining.com/reach-ui/checkbox#checkboxgroup-initialstates for details.`
  );
}

// May be over-simplified, maybe we don't need to do this
// but I thought it might be helpful
function kebabCase(str) {
  const result = str.replace(
    /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g,
    match => "-" + match.toLowerCase()
  );
  return str[0] === str[0].toUpperCase() ? result.substring(1) : result;
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

const makeId = (id, index) => `${id}--${index}`;
