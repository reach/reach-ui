/**
 * Welcome to @reach/listbox!
 *
 * See NOTES.md for some background info if you're interested!
 *
 * TODO: Test in a form
 * TODO: Finish prop types
 *
 * @see Docs     https://reacttraining.com/reach-ui/listbox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/listbox
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#Listbox
 */

import React, {
  forwardRef,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import Popover, { PopoverProps, positionMatchWidth } from "@reach/popover";
import {
  createDescendantContext,
  Descendant,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendants,
} from "@reach/descendants";
import {
  checkStyles,
  createNamedContext,
  DistributiveOmit,
  forwardRefWithAs,
  isBoolean,
  isFunction,
  isRightClick,
  isString,
  makeId,
  stateToAttributeString,
  useControlledSwitchWarning,
  useForkedRef,
  useIsomorphicLayoutEffect as useLayoutEffect,
  wrapEvent,
} from "@reach/utils";
import {
  MachineToReactRefMap,
  StateMachine,
  useCreateMachine,
  useMachine,
  useMachineLogger,
} from "@reach/machine";
import {
  createMachineDefinition,
  ListboxEvents,
  ListboxStates,
  ListboxNodeRefs,
  ListboxStateData,
  ListboxEvent,
  ListboxState,
} from "./machine";

const DEBUG = __DEV__
  ? // set here if we want to debug during development
    false
  : // leave this alone!
    false;

////////////////////////////////////////////////////////////////////////////////
// ListboxContext

const ListboxDescendantContext = createDescendantContext<
  HTMLElement,
  ListboxDescendantProps
>("ListboxDescendantContext");
const ListboxContext = createNamedContext(
  "ListboxContext",
  {} as ListboxContextValue
);
const ListboxGroupContext = createNamedContext(
  "ListboxGroupContext",
  {} as ListboxGroupContextValue
);
const useDescendantContext = () => useContext(ListboxDescendantContext);
const useListboxContext = () => useContext(ListboxContext);
const useListboxGroupContext = () => useContext(ListboxGroupContext);

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxInput
 *
 * The top-level component and context provider for the listbox.
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput
 */
export const ListboxInput = forwardRef<
  HTMLDivElement,
  ListboxInputProps & { _componentName?: string }
>(function ListboxInput(
  {
    "aria-labelledby": ariaLabelledBy,
    children,
    defaultValue,
    disabled = false,
    form,
    name,
    onChange,
    required,
    value: valueProp,

    // We only use this prop for console warnings
    _componentName = "ListboxInput",
    ...props
  },
  forwardedRef
) {
  let { current: isControlled } = useRef(valueProp != null);
  let [options, setOptions] = useDescendants<
    HTMLElement,
    ListboxDescendantProps
  >();

  // We will track when a mouse has moved in a ref, then reset it to false each
  // time a popover closes. This is useful because we want the selected value of
  // the listbox to be highlighted when the user opens it, but if the pointer
  // is resting above an option it will steal the highlight.
  // TODO: Use state machine instead
  let mouseMovedRef = useRef(false);

  // If a user clicks the button while the listbox is open, the blur event
  // will close the popover and send us back to IDLE. The mousup event will
  // then fire and send us right back to NAVIGATING, which we probably don't
  // want.
  // TODO: We can probably do this better in the state machine, but for now
  // this ref will track where these mouse events are starting so we can
  // conditionally send events based on this value. Old habits die hard 🙃
  let mouseEventStartedRef = useRef(false);

  // DOM refs
  let input = useRef<ListboxNodeRefs["input"]>(null);
  let button = useRef<ListboxNodeRefs["button"]>(null);
  let popover = useRef<ListboxNodeRefs["popover"]>(null);
  let list = useRef<ListboxNodeRefs["list"]>(null);

  let machine = useCreateMachine(
    createMachineDefinition({
      value: (isControlled ? valueProp! : defaultValue) || null,
    })
  );
  let [current, send] = useMachineLogger(
    useMachine(machine, {
      input,
      button,
      popover,
      list,
    }),
    DEBUG
  );

  // IDs for aria attributes
  let _id = useId(props.id);
  let id = props.id || makeId("listbox-input", _id);

  let ref = useForkedRef(input, forwardedRef);

  // If the button has children, we just render them as the label.
  // Otherwise we'll find the option with a value that matches the listbox value
  // and use its label in the button. We'll get that here and send it to the
  // button via context.
  // If a user needs the label for SSR to prevent hydration mismatch issues,
  // they need to control the state of the component and pass a label directly
  // to the button.
  let valueLabel = useMemo(() => {
    let selected = options.find(
      option => option.value === current.context.value
    );
    return selected ? selected.label : null;
  }, [options, current.context.value]);

  let context: ListboxContextValue = useMemo(() => {
    return {
      disabled,
      ids: {
        label: ariaLabelledBy,
        input: id,
        listbox: makeId("listbox", id),
        button: makeId("button", id),
      },
      listboxValue: current.context.value,
      listboxValueLabel: valueLabel,
      mouseEventStartedRef,
      mouseMovedRef,
      onValueChange: onChange,
      refs: {
        input,
        button,
        popover,
        list,
      },
      send,
      state: current,
    };
  }, [ariaLabelledBy, current, disabled, id, onChange, send, valueLabel]);

  useControlledSwitchWarning(valueProp, "value", _componentName);

  // For uncontrolled listbox components where no `defaultValue` is provided, we
  // will update the value based on the value of the first selectable option.
  // We call the update directly because:
  //   A) we only ever need to do this once, so we can guard with a mounted ref
  //   B) useLayoutEffect races useDecendant, so we might not have options yet
  //   C) useEffect will cause a flash
  let mounted = useRef(false);
  if (!isControlled && !defaultValue && !mounted.current && options.length) {
    mounted.current = true;
    let first = options.find(option => !option.disabled);
    if (first && first.value) {
      send({
        type: ListboxEvents.ValueChange,
        value: first.value!,
      });
    }
  }

  // We need to get some data from props to pass to the state machine in the
  // event that they change
  if (isControlled && valueProp !== current.context.value) {
    send({
      type: ListboxEvents.ValueChange,
      value: valueProp!,
    });
  }

  useLayoutEffect(() => {
    send({
      type: ListboxEvents.GetDerivedData,
      data: { options },
    });
  }, [options, send]);

  useEffect(() => {
    function listener(event: MouseEvent) {
      let { target, relatedTarget } = event;
      send({
        type: ListboxEvents.OutsideMouseDown,
        relatedTarget: relatedTarget || target,
      });
    }
    window.addEventListener("mousedown", listener);
    return () => {
      window.removeEventListener("mousedown", listener);
    };
  }, [send]);

  useEffect(() => checkStyles("listbox"), []);

  return (
    <DescendantProvider
      context={ListboxDescendantContext}
      items={options}
      set={setOptions}
    >
      <ListboxContext.Provider value={context}>
        <div
          {...props}
          ref={ref}
          data-reach-listbox-input=""
          data-state={stateToAttributeString(current.value)}
          data-value={current.context.value}
          id={id}
        >
          {isFunction(children)
            ? children({
                value: current.context.value,
                valueLabel,
              })
            : children}
        </div>
        {(disabled || form || name || required) && (
          <ListboxHiddenInput
            disabled={disabled}
            form={form}
            name={name}
            required={required}
          />
        )}
      </ListboxContext.Provider>
    </DescendantProvider>
  );
});

if (__DEV__) {
  ListboxInput.displayName = "ListboxInput";
  ListboxInput.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    form: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.string,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-props
 */
export type ListboxInputProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  // WHY ARE THESE A THING ON A DIV, UGH
  "autoComplete" | "autoFocus" | "form" | "name" | "onChange" | "defaultValue"
> &
  Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "autoComplete" | "autoFocus" | "form" | "name" | "required"
  > & {
    /**
     * The composed listbox expects to receive `ListboxButton` and
     * `ListboxPopover` as children. You can also pass in arbitrary wrapper
     * elements if desired.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-children
     */
    children:
      | React.ReactNode
      | ((props: {
          value: ListboxValue | null;
          valueLabel: string | null;
        }) => React.ReactNode);
    /**
     * The callback that fires when the listbox value changes.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-onchange
     * @param newValue
     */
    onChange?(newValue: ListboxValue): void;
    /**
     * The current value of the listbox.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-value
     */
    value?: ListboxValue;
    /**
     * The default value of an uncontrolled listbox.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-defaultvalue
     */
    defaultValue?: ListboxValue;
  };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxHiddenInput
 */
const ListboxHiddenInput: React.FC<React.InputHTMLAttributes<
  HTMLInputElement
>> = props => {
  let { state } = useListboxContext();
  return (
    <input type="text" hidden {...props} value={state.context.value || ""} />
  );
};

if (__DEV__) {
  ListboxHiddenInput.displayName = "ListboxHiddenInput";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Listbox
 *
 * High-level listbox API
 *
 * <Listbox>
 *   <ListboxOption value="1">Option 1</ListboxOption>
 *   <ListboxOption value="2">Option 2</ListboxOption>
 *   <ListboxOption value="3">Option 3</ListboxOption>
 * </Listbox>
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-1
 */
export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(
  function Listbox({ arrow = "▼", button, children, ...props }, forwardedRef) {
    return (
      <ListboxInput {...props} _componentName="Listbox" ref={forwardedRef}>
        {({ value, valueLabel }) => (
          <Fragment>
            <ListboxButton
              arrow={arrow}
              children={
                button
                  ? isFunction(button)
                    ? button({ value, label: valueLabel })
                    : button
                  : undefined
              }
            />
            <ListboxPopover>
              <ListboxList>{children}</ListboxList>
            </ListboxPopover>
          </Fragment>
        )}
      </ListboxInput>
    );
  }
);

if (__DEV__) {
  Listbox.displayName = "Listbox";
  Listbox.propTypes = {
    ...ListboxInput.propTypes,
    arrow: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    button: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-props
 */
export type ListboxProps = ListboxInputProps & {
  arrow?: React.ReactNode | boolean;
  button?:
    | React.ReactNode
    | ((props: {
        value: ListboxValue | null;
        label: string | null;
      }) => React.ReactNode);
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxButton
 */
export const ListboxButton = forwardRefWithAs<ListboxButtonProps, "span">(
  function ListboxButton(
    {
      arrow = false,
      as: Comp = "span",
      children,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      tabIndex,
      ...props
    },
    forwardedRef
  ) {
    let {
      ids: { button: buttonId, label: labelId, listbox: listboxId },
      mouseEventStartedRef,
      refs: { button: buttonRef },
      state,
      send,
      listboxValueLabel,
    } = useListboxContext();
    let listboxValue = state.context.value;

    let ref = useForkedRef(buttonRef, forwardedRef);

    let handleKeyDown = useKeyDown();

    function handleMouseDown(event: React.MouseEvent) {
      if (!isRightClick(event.nativeEvent)) {
        mouseEventStartedRef.current = true;
        event.persist();
        event.preventDefault();
        send({ type: ListboxEvents.ButtonMouseDown });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (mouseEventStartedRef.current) {
        if (!isRightClick(event.nativeEvent)) {
          send({ type: ListboxEvents.ButtonMouseUp });
        }
      }
      mouseEventStartedRef.current = false;
    }

    let expanded = isExpanded(state.value as ListboxStates);

    // If the button has children, we just render them as the label
    // If a user needs the label on the server to prevent hydration mismatch
    // errors, they need to control the state of the component and pass a label
    // directly to the button.
    let label: React.ReactNode = useMemo(() => {
      if (!children) {
        return listboxValueLabel;
      } else if (isFunction(children)) {
        return children({
          isExpanded: expanded,
          label: listboxValueLabel!,
          value: listboxValue,
        });
      }
      return children;
    }, [children, listboxValueLabel, expanded, listboxValue]);

    return (
      <Comp
        aria-controls={listboxId}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-labelledby={[labelId, buttonId].filter(Boolean).join(" ")}
        role="button"
        {...props}
        ref={ref}
        data-reach-listbox-button=""
        id={buttonId}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        tabIndex={tabIndex ?? 0}
      >
        {label}
        {arrow && (
          <ListboxArrow>{!isBoolean(arrow) ? arrow : null}</ListboxArrow>
        )}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxButton.displayName = "ListboxButton";
  ListboxButton.propTypes = {
    arrow: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxbutton-props
 */
export type ListboxButtonProps = {
  arrow?: React.ReactNode | boolean;
  children?:
    | React.ReactNode
    | ((props: {
        value: ListboxValue | null;
        label: string;
        isExpanded: boolean;
      }) => React.ReactNode);
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxArrow
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxarrow
 */
export const ListboxArrow = forwardRef<HTMLSpanElement, ListboxArrowProps>(
  function ListboxArrow({ children, ...props }, forwardedRef) {
    let {
      state: { value: state },
    } = useListboxContext();
    let expanded = isExpanded(state as ListboxStates);
    let defaultArrow = expanded ? "▲" : "▼";
    return (
      <span
        aria-hidden
        {...props}
        ref={forwardedRef}
        data-reach-listbox-arrow=""
      >
        {isFunction(children)
          ? children({ isExpanded: expanded })
          : children || defaultArrow}
      </span>
    );
  }
);

if (__DEV__) {
  ListboxArrow.displayName = "ListboxArrow";
  ListboxArrow.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxarrow-props
 */
export type ListboxArrowProps = React.HTMLProps<HTMLSpanElement> & {
  children?:
    | React.ReactNode
    | ((props: { isExpanded: boolean }) => React.ReactNode);
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxPopover
 */
export const ListboxPopover = forwardRef<any, ListboxPopoverProps>(
  function ListboxPopover(
    {
      position = positionMatchWidth,
      onBlur,
      onKeyDown,
      portal = true,
      ...props
    },
    forwardedRef
  ) {
    let {
      refs: { popover: popoverRef, button: buttonRef },
      send,
      state: { value: state },
    } = useListboxContext();
    let ref = useForkedRef(popoverRef, forwardedRef);

    let handleKeyDown = useKeyDown();

    let commonProps = {
      ...props,
      ref,
      "data-reach-listbox-popover": "",
      hidden: !isExpanded(state as ListboxStates),
      onBlur: wrapEvent(onBlur, handleBlur),
      onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
      tabIndex: -1,
    };

    function handleBlur(event: React.FocusEvent) {
      let { nativeEvent } = event;
      requestAnimationFrame(() => {
        send({
          type: ListboxEvents.Blur,
          relatedTarget: nativeEvent.relatedTarget || nativeEvent.target,
        });
      });
    }

    return portal ? (
      <Popover
        {...commonProps}
        targetRef={buttonRef as any}
        position={position}
      />
    ) : (
      <div {...commonProps} />
    );
  }
);

if (__DEV__) {
  ListboxPopover.displayName = "ListboxPopover";
  ListboxPopover.propTypes = {
    portal: PropTypes.bool,
    children: PropTypes.node,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxpopover-props
 */
export type ListboxPopoverProps = React.HTMLProps<HTMLDivElement> & {
  portal?: boolean;
  children: React.ReactNode;
  position?: PopoverProps["position"];
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxList
 */
export const ListboxList = forwardRefWithAs<ListboxListProps, "ul">(
  function ListboxList({ as: Comp = "ul", ...props }, forwardedRef) {
    let {
      ids: { listbox: listboxId, label: labelId },
      refs: { list: listRef },
      state: {
        context: { value },
      },
    } = useListboxContext();
    let ref = useForkedRef(forwardedRef, listRef);

    return (
      <Comp
        aria-activedescendant={useOptionId(value)}
        aria-labelledby={labelId}
        role="listbox"
        {...props}
        ref={ref}
        data-reach-listbox-list=""
        id={listboxId}
        tabIndex={-1}
      />
    );
  }
);

if (__DEV__) {
  ListboxList.displayName = "ListboxList";
  ListboxList.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxlist-props
 */
export type ListboxListProps = {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxOption
 */
export const ListboxOption = forwardRefWithAs<ListboxOptionProps, "li">(
  function ListboxOption(
    {
      as: Comp = "li",
      children,
      disabled,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      value,
      label: labelProp,
      ...props
    },
    forwardedRef
  ) {
    if (__DEV__ && !value) {
      throw Error(`A ListboxOption must have a value prop.`);
    }

    let {
      send,
      state: {
        context: { value: listboxValue, navigationValue },
      },
      onValueChange,
      mouseEventStartedRef,
      mouseMovedRef,
    } = useListboxContext();

    let [labelState, setLabel] = useState(labelProp);
    let label = labelProp || labelState || "";

    let ownRef = useRef<HTMLElement | null>(null);
    useDescendant({
      context: ListboxDescendantContext,
      element: ownRef.current!,
      value,
      label,
      disabled: !!disabled,
    });

    // After the ref is mounted to the DOM node, we check to see if we have an
    // explicit label prop before looking for the node's textContent for
    // typeahead functionality.
    let getLabelFromDomNode = useCallback(
      (node: HTMLElement) => {
        if (!labelProp) {
          setLabel(prevState => {
            if (node.textContent && prevState !== node.textContent) {
              return node.textContent;
            }
            return prevState || "";
          });
        }
      },
      [labelProp]
    );
    let ref = useForkedRef(getLabelFromDomNode, forwardedRef, ownRef);

    let isHighlighted = navigationValue ? navigationValue === value : false;
    let isSelected = listboxValue === value;

    function handleMouseEnter() {
      // If the user hasn't moved their mouse but mouse enter event still fires
      // (this happens if the popup opens due to a keyboard event), we don't
      // want to change the navigationSelect value
      if (mouseMovedRef.current) {
        mouseMovedRef.current = false;
        send({
          type: ListboxEvents.Navigate,
          value,
          disabled: !!disabled,
        });
      }
    }

    function handleMouseLeave() {
      send({ type: ListboxEvents.ClearNavSelection });
    }

    function handleMouseDown(event: React.MouseEvent) {
      // Prevent blur event from firing and bubbling to the popover
      event.preventDefault();
      mouseEventStartedRef.current = true;
      if (!isRightClick(event.nativeEvent)) {
        send({ type: ListboxEvents.OptionStartClick });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (mouseEventStartedRef.current) {
        mouseEventStartedRef.current = false;
        if (!isRightClick(event.nativeEvent)) {
          send({
            type: ListboxEvents.OptionFinishClick,
            value,
            callback: onValueChange,
            disabled: !!disabled,
          });
        }
      }
    }

    function handleMouseMove() {
      mouseMovedRef.current = true;
      // We don't really *need* this guard if we put this in the state machine,
      // but in this case it seems wise not to needlessly run our transitions
      // every time the user's mouse moves. Seems like a lot.
      if (navigationValue !== value) {
        send({
          type: ListboxEvents.Navigate,
          value,
          disabled: !!disabled,
        });
      }
    }

    return (
      <Comp
        aria-selected={isSelected}
        aria-disabled={disabled ? true : undefined}
        role="option"
        {...props}
        ref={ref}
        id={useOptionId(value)}
        data-reach-listbox-option=""
        data-highlighted={isHighlighted ? "" : undefined}
        data-label={label}
        data-value={value}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseEnter={wrapEvent(onMouseEnter, handleMouseEnter)}
        onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
        onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        tabIndex={-1}
      >
        {children}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxOption.displayName = "ListboxOption";
  ListboxOption.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-props
 */
export type ListboxOptionProps = {
  /**
   * The option's value. This will be passed into a hidden input field for use
   * in forms.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-value
   */
  value: ListboxValue;
  /**
   * The option's human-readable label. This prop is optional but highly
   * encouraged if your option has multiple text nodes that may or may not
   * correlate with the intended value. It is also ueful if the inner text node
   * begins with a character other than a readable letter (like an emoji or
   * symbol) so that typeahead works as expected for the user.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-label
   */
  label?: string;
  /**
   * Whether or not the option is disabled from selection and navigation.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-disabled
   */
  disabled?: boolean;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroup
 */
export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(
  function ListboxGroup({ label, children, ...props }, forwardedRef) {
    let {
      ids: { listbox: listboxId },
    } = useListboxContext();
    let labelId = makeId("label", useId(props.id), listboxId);
    return (
      <ListboxGroupContext.Provider value={{ labelId }}>
        <div
          aria-labelledby={labelId}
          role="group"
          {...props}
          ref={forwardedRef}
        >
          {label && <ListboxGroupLabel>{label}</ListboxGroupLabel>}
          {children}
        </div>
      </ListboxGroupContext.Provider>
    );
  }
);

if (__DEV__) {
  ListboxGroup.displayName = "ListboxGroup";
  ListboxGroup.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  "label"
> & {
  /**
   * The text label to use for the listbox group. This can be omitted if a
   * group contains a `ListboxGroupLabel` component. The label should always
   * be human-readable.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-label
   */
  label?: string;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroupLabel
 */
export const ListboxGroupLabel = forwardRefWithAs<
  ListboxGroupLabelProps,
  "span"
>(function ListboxGroupLabel({ as: Comp = "span", ...props }, forwardedRef) {
  let { labelId } = useListboxGroupContext();
  return (
    <Comp
      role="none"
      {...props}
      ref={forwardedRef}
      data-reach-listbox-group-label=""
      id={labelId}
    />
  );
});

if (__DEV__) {
  ListboxGroupLabel.displayName = "ListboxGroupLabel";
  ListboxGroupLabel.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupLabelProps = {};

////////////////////////////////////////////////////////////////////////////////

function isExpanded(state: ListboxStates) {
  return [
    ListboxStates.Navigating,
    ListboxStates.NavigatingWithKeys,
    ListboxStates.Interacting,
    ListboxStates.Searching,
  ].includes(state);
}

function useKeyDown() {
  let {
    onValueChange,
    state: {
      context: { navigationValue, typeaheadQuery },
    },
    send,
  } = useListboxContext();

  let { descendants: options } = useDescendantContext();

  useEffect(() => {
    if (typeaheadQuery) {
      send({
        type: ListboxEvents.UpdateAfterTypeahead,
        query: typeaheadQuery,
        callback: onValueChange,
      });
    }
    let timeout = window.setTimeout(() => {
      if (typeaheadQuery != null) {
        send({ type: ListboxEvents.ClearTypeahead });
      }
    }, 1000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [onValueChange, send, typeaheadQuery]);

  let index = options.findIndex(({ value }) => value === navigationValue);

  let handleKeyDown = wrapEvent(
    function(event: React.KeyboardEvent) {
      let { key } = event;
      let isSearching = isString(key) && key.length === 1;
      let navOption = options.find(option => option.value === navigationValue);
      switch (key) {
        case "Enter":
          send({
            type: ListboxEvents.KeyDownEnter,
            value: navigationValue,
            callback: onValueChange,
            disabled: !!navOption?.disabled,
          });
          return;
        case " ":
          send({
            type: ListboxEvents.KeyDownSpace,
            value: navigationValue,
            callback: onValueChange,
            disabled: !!navOption?.disabled,
          });
          return;
        case "Escape":
          send({ type: ListboxEvents.KeyDownEscape });
          return;
        case "Tab":
          let eventType = event.shiftKey
            ? ListboxEvents.KeyDownShiftTab
            : ListboxEvents.KeyDownTab;
          send({ type: eventType });
          return;
        default:
          if (isSearching) {
            send({
              type: ListboxEvents.KeyDownSearch,
              query: key,
            });
          }
          return;
      }
    },

    useDescendantKeyDown(ListboxDescendantContext, {
      currentIndex: index,
      orientation: "vertical",
      key: "index",
      rotate: true,
      filter: option => !option.disabled,
      callback(nextIndex: number) {
        send({
          type: ListboxEvents.KeyDownNavigate,
          value: options[nextIndex].value,
        });
      },
    })
  );

  return handleKeyDown;
}

function useOptionId(value: ListboxValue | null) {
  let {
    ids: { input },
  } = useListboxContext();
  return value ? makeId(`option-${value}`, input) : "";
}

////////////////////////////////////////////////////////////////////////////////
// Types

export type ListboxValue = string;

export interface ListboxDescendantProps {
  value: ListboxValue;
  label: string;
  disabled: boolean;
}

export type ListboxDescendant = Descendant<HTMLElement, ListboxDescendantProps>;

export interface ListboxContextValue {
  refs: MachineToReactRefMap<ListboxEvent>;
  disabled: boolean;
  ids: {
    label: string | undefined;
    button: string;
    input: string;
    listbox: string;
  };
  listboxValue: ListboxValue | null;
  listboxValueLabel: string | null;
  mouseEventStartedRef: React.MutableRefObject<boolean>;
  mouseMovedRef: React.MutableRefObject<boolean>;
  onValueChange: ((newValue: ListboxValue) => void) | null | undefined;
  send: StateMachine.Service<
    ListboxStateData,
    DistributiveOmit<ListboxEvent, "refs">
  >["send"];
  state: StateMachine.State<ListboxStateData, ListboxEvent, ListboxState>;
}

export interface ListboxGroupContextValue {
  labelId: string;
}
