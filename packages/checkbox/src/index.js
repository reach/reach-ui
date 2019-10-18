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
  element
} from "prop-types";

import "./checkbox.css";

/**
 *
 * Idea for examples?
 *
 * <MultiCheckboxGroup>
 *   <MultiCheckbox label="All Condiments" name="condiments">
 *      <Checkbox label="Mayo" value="mayo" />
 *      <Checkbox label="Mustard" value="mustard" />
 *      <Checkbox label="Ketchup" value="ketchup" />
 *    </MultiCheckbox>
 * </MultiCheckboxGroup>
 *
 * RENDERS >>>>>
 *
 * <fieldset>
 *   <ul>
 *     <li>
 *       <label ... />
 *       <input ... />
 *       <ul>
 *         <li><label ... /><input ... /></li>
 *         <li><label ... /><input ... /></li>
 *         <li><label ... /><input ... /></li>
 *       </ul>
 *     </li>
 *   </ul>
 * </fieldset>
 */

const CheckboxGroupContext = createContext({
  legend: undefined,
  name: undefined,
  checkedStates: undefined,
  setCheckedStates: undefined,
  groupId: undefined,
  disabled: undefined,
  grouped: false
});

const sharedPropTypes = {
  checked: oneOfType([bool, string]),
  defaultChecked: bool,
  disabled: bool,
  name: string,
  onChange: func,
  readOnly: bool,
  required: bool,
  value: any
};

////////////////////////////////////////////////////////////////////////////////
export const Checkbox = forwardRef(function Checkbox(
  { label, ...props },
  forwardedRef
) {
  const {
    as,
    name,
    value: valueProp,
    inputId: inputIdProp,
    checked,
    onChange,
    defaultChecked,
    ...wrapperProps
  } = props;

  if (__DEV__) {
    warning(
      valueProp,
      `Checkbox requires a \`value\` prop. A value has been inferred from its label.`
    );
  }

  const { groupId, grouped } = useContext(CheckboxGroupContext);

  const fallbackId = `checkbox--${useId()}`;
  const value = valueProp || kebabCase(label);
  const inputId =
    inputIdProp ||
    (grouped && groupId ? `${groupId}--${fallbackId}` : fallbackId);

  const inputProps = {
    as,
    name,
    value,
    id: inputId,
    checked,
    onChange,
    defaultChecked
  };

  return (
    <div data-reach-checkbox ref={forwardedRef} {...wrapperProps}>
      <CheckboxInput {...inputProps} />
      <label htmlFor={inputId} data-reach-checkbox-label>
        {label}
      </label>
    </div>
  );
});

if (__DEV__) {
  Checkbox.propTypes = {
    ...sharedPropTypes,
    label: string.isRequired,
    inputId: string
  };
  Checkbox.displayName = "Checkbox";
}

////////////////////////////////////////////////////////////////////////////////
export const CheckboxInput = React.forwardRef(function CheckboxInput(
  {
    as: Comp = "input",
    autoComplete,
    autoFocus,
    checked: controlledChecked,
    checkedIcon,
    defaultChecked,
    disabled: disabledProp,
    form,
    icon,
    id: idProp,
    name: nameProp,
    onBlur,
    onChange,
    onFocus,
    readOnly,
    required,
    tabIndex,
    value,
    ...props
  },
  forwardedRef
) {
  const { current: isControlled } = React.useRef(controlledChecked != null);
  const [checkedState, setCheckedState] = React.useState(
    Boolean(defaultChecked)
  );
  const [isFocused, setFocused] = React.useState(false);
  const {
    disabled: disabledGroup,
    checkedStates,
    grouped,
    groupId,
    name: groupName,
    onChange: groupOnChange
  } = useContext(CheckboxGroupContext);

  const inputRef = useRef(null);
  const ref = useForkedRef(forwardedRef, Comp === "input" ? inputRef : null);

  const disabled = disabledProp || disabledGroup;
  const checked = isControlled ? controlledChecked : checkedState;
  const mixed = checked === "mixed";

  const fallbackId = `checkbox--${useId()}`;
  const name = grouped ? groupName : nameProp;
  const inputId =
    idProp || (grouped && groupId ? `${groupId}--${fallbackId}` : fallbackId);

  function handleChange(event) {
    const { checked } = event.target;

    if (grouped && groupOnChange) {
      groupOnChange(event);
      return;
    }

    if (!isControlled) {
      setCheckedState(checked);
    }

    if (onChange) {
      onChange(event);
    }
  }

  useEffect(() => {
    inputRef.current.indeterminate = mixed;
    inputRef.current.checked = checked === true ? true : false;
  }, [mixed, checked]);

  if (__DEV__) {
    checkboxErrorChecks({
      isControlled,
      controlledChecked,
      value,
      grouped,
      defaultChecked,
      checkedStates
    });
  }

  const outerProps = {
    "data-reach-checkbox-input": "",
    "data-checked": checked ? "" : undefined,
    "data-mixed": mixed ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-read-only": readOnly ? "" : undefined,
    ...props
  };

  const inputProps = {
    "aria-checked": mixed ? "mixed" : String(checked),
    "data-mixed": mixed,
    autoComplete,
    autoFocus,
    checked,
    defaultChecked,
    disabled,
    form,
    id: inputId,
    name,
    onChange: handleChange,
    readOnly,
    required,
    tabIndex,
    type: "checkbox",
    value
  };

  return Comp === "input" ? (
    <input
      ref={ref}
      onFocus={onFocus}
      onBlur={onBlur}
      {...outerProps}
      {...inputProps}
    />
  ) : (
    <Comp
      ref={ref}
      data-reach-checkbox-input-wrapper=""
      data-focus={isFocused ? "" : undefined}
      {...outerProps}
    >
      <input
        data-reach-checkbox-input-hidden
        ref={inputRef}
        {...inputProps}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
          cursor: "inherit",
          opacity: 0,
          zIndex: 1
        }}
        onFocus={wrapEvent(onFocus, () => {
          setFocused(true);
        })}
        onBlur={wrapEvent(onFocus, () => {
          setFocused(false);
        })}
      />
    </Comp>
  );
});

if (__DEV__) {
  CheckboxInput.propTypes = {
    ...sharedPropTypes,
    autoFocus: bool,
    checked: oneOfType([bool, string]),
    defaultChecked: bool,
    disabled: bool,
    name: string,
    onChange: func,
    readOnly: bool,
    required: bool,
    value: any.isRequired
  };
  CheckboxInput.displayName = "CheckboxInput";
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
  const fallbackId = `checkbox-group--${useId()}`;
  const id = idProp || fallbackId;

  if (__DEV__) {
    checkboxGroupErrorChecks({
      inControlledGroup,
      controlledcheckedStates,
      nameProp,
      legend
    });
  }

  function onChange(event) {
    const { checked, value } = event.target;

    if (!inControlledGroup) {
      setCheckedStates({ ...checkedStates, [value]: Boolean(checked) });
    }

    if (onChangeProp) {
      onChangeProp(event);
    }
  }

  return (
    <CheckboxGroupContext.Provider
      value={{
        groupId: id,
        legend,
        name,
        checkedStates,
        onChange,
        grouped: true
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
    name: string
  };
  CheckboxGroup.displayName = "CheckboxGroup";
}

////////////////////////////////////////////////////////////////////////////////
const getControlledPropWarning = (prop, component) =>
  `${component} should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ${component} for the lifetime of the component. Check the \`${prop}\` prop being passed in.`;

function checkboxGroupErrorChecks({
  inControlledGroup,
  controlledcheckedStates,
  nameProp,
  legend
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

  warning(
    !(!nameProp && legend),
    `CheckboxGroup requires a name prop. A value has been inferred from the legend.`
  );

  warning(
    !(!nameProp && !legend),
    "CheckboxGroup requires name prop, and no legend prop has been detected for a fallback name. A checkbox input without a name attribute may yield unexpected results."
  );
}

function checkboxErrorChecks({
  isControlled,
  controlledChecked,
  checkedStates,
  defaultChecked,
  grouped,
  value
}) {
  const component = "CheckboxInput";
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
    value,
    `${component} requires a value prop. A checkbox input without a value attribute may yield unexpected results.`
  );

  warning(
    !(grouped && defaultChecked),
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
