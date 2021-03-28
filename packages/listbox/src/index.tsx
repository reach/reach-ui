/**
 * Welcome to @reach/listbox!
 *
 * See NOTES.md for some background info if you're interested!
 *
 * TODO: OS-specific behavior (ie, Enter key on native select on Windows)
 * TODO: Consider hack to implement focus controls in forms on iOS
 *       https://github.com/angular/material/issues/8440
 *       Instead of a hidden select, maybe use a visually hidden select with
 *       aria-hidden. When that input gets focus, immediate send focus to the
 *       ListboxButton, then toggle the hidden input's tabIndex to prevent
 *       re-focusing it (this is just an idea, may not work, no idea how some
 *       screen-reader would deal with it).
 * TODO: Write examples showing fallback to a native select menu for users
 *       without JavaScript enabled and small-screen users.
 * TODO: Check positioning on mobile near collision points
 *       https://twitter.com/PipoPeperoni/status/1237597623508275200
 * TODO: Test arrow key navigation in forms in Firefox.
 *       Probably similar solution needed for iOS issue above.
 *       https://twitter.com/GassnerKendall/status/1237778370118598661
 *
 * @see Docs     https://reach.tech/listbox
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/listbox
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox
 */

import * as React from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import { Popover, positionMatchWidth } from "@reach/popover";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendants,
  useDescendantsInit,
} from "@reach/descendants";
import {
  createNamedContext,
  forwardRefWithAs,
  isBoolean,
  isFunction,
  isRightClick,
  isString,
  makeId,
  memoWithAs,
  useCheckStyles,
  useControlledSwitchWarning,
  useForkedRef,
  useIsomorphicLayoutEffect as useLayoutEffect,
  useStableCallback,
  wrapEvent,
} from "@reach/utils";
import { useCreateMachine, useMachine } from "@reach/machine";
import {
  createMachineDefinition,
  ListboxEvents,
  ListboxStates,
} from "./machine";

import type { Descendant } from "@reach/descendants";
import type { DistributiveOmit } from "@reach/utils";
import type { StateMachine } from "@reach/machine";
import type {
  ListboxNodeRefs,
  ListboxStateData,
  ListboxEvent,
} from "./machine";
import type { PopoverProps } from "@reach/popover";

const DEBUG = false;

////////////////////////////////////////////////////////////////////////////////
// ListboxContext

const ListboxDescendantContext = createDescendantContext<ListboxDescendant>(
  "ListboxDescendantContext"
);
const ListboxContext = createNamedContext(
  "ListboxContext",
  {} as InternalListboxContextValue
);
const ListboxGroupContext = createNamedContext(
  "ListboxGroupContext",
  {} as ListboxGroupContextValue
);

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxInput
 *
 * The top-level component and context provider for the listbox.
 *
 * @see Docs https://reach.tech/listbox#listboxinput
 */
const ListboxInput = forwardRefWithAs<
  ListboxInputProps & { _componentName?: string },
  "div"
>(function ListboxInput(
  {
    as: Comp = "div",
    "aria-labelledby": ariaLabelledBy,
    "aria-label": ariaLabel,
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
  let isControlled = React.useRef(valueProp != null);
  let [options, setOptions] = useDescendantsInit<ListboxDescendant>();

  // DOM refs
  let buttonRef = React.useRef<ListboxNodeRefs["button"]>(null);
  let hiddenInputRef = React.useRef<HTMLInputElement>(null);
  let highlightedOptionRef = React.useRef<ListboxNodeRefs["highlightedOption"]>(
    null
  );
  let inputRef = React.useRef<ListboxNodeRefs["input"]>(null);
  let listRef = React.useRef<ListboxNodeRefs["list"]>(null);
  let popoverRef = React.useRef<ListboxNodeRefs["popover"]>(null);
  let selectedOptionRef = React.useRef<ListboxNodeRefs["selectedOption"]>(null);

  let machine = useCreateMachine(
    createMachineDefinition({
      // The initial value of our machine should come from the `value` or
      // `defaultValue` props if they exist.
      value: (isControlled.current ? valueProp! : defaultValue) || null,
    })
  );

  let [state, send] = useMachine(
    machine,
    {
      button: buttonRef,
      hiddenInput: hiddenInputRef,
      highlightedOption: highlightedOptionRef,
      input: inputRef,
      list: listRef,
      popover: popoverRef,
      selectedOption: selectedOptionRef,
    },
    DEBUG
  );

  let stableOnChange = useStableCallback((newValue: string) => {
    if (newValue !== state.context.value) {
      onChange?.(newValue);
    }
  });

  // IDs for aria attributes
  let _id = useId(props.id);
  let id = props.id || makeId("listbox-input", _id);

  let ref = useForkedRef(inputRef, forwardedRef);

  // If the button has children, we just render them as the label.
  // Otherwise we'll find the option with a value that matches the listbox value
  // and use its label in the button. We'll get that here and send it to the
  // button via context.
  // If a user needs the label for SSR to prevent hydration mismatch issues,
  // they need to control the state of the component and pass a label directly
  // to the button.
  let valueLabel = React.useMemo(() => {
    let selected = options.find(
      (option) => option.value === state.context.value
    );
    return selected ? selected.label : null;
  }, [options, state.context.value]);

  let isExpanded = isListboxExpanded(state.value);

  // TODO: Remove duplication and memoize
  let context: InternalListboxContextValue = React.useMemo(
    () => ({
      ariaLabel,
      ariaLabelledBy,
      disabled,
      isExpanded,
      listboxId: id,
      listboxValueLabel: valueLabel,
      onValueChange: stableOnChange,
      buttonRef,
      listRef,
      popoverRef,
      selectedOptionRef,
      highlightedOptionRef,
      send,
      state: state.value as ListboxStates,
      stateData: state.context,
    }),
    [
      ariaLabel,
      ariaLabelledBy,
      state.value,
      state.context,
      disabled,
      id,
      isExpanded,
      stableOnChange,
      send,
      valueLabel,
    ]
  );

  // For uncontrolled listbox components where no `defaultValue` is provided, we
  // will update the value based on the value of the first selectable option.
  // We call the update directly because:
  //   A) we only ever need to do this once, so we can guard with a ref
  //   B) useLayoutEffect races useDecendant, so we might not have options yet
  //   C) useEffect will cause a flash
  let mounted = React.useRef(false);
  if (
    !isControlled.current && // the app is not controlling state
    defaultValue == null && // there is no default value
    !mounted.current && // we haven't done this already
    options.length // we have some options
  ) {
    mounted.current = true;
    let first = options.find((option) => !option.disabled);
    if (first && first.value) {
      send({
        type: ListboxEvents.ValueChange,
        value: first.value!,
      });
    }
  }

  useControlledSwitchWarning(valueProp, "value", _componentName);

  // Even if the app controls state, we still need to update it internally to
  // run the state machine transitions
  useControlledStateSync(valueProp, state.context.value, () => {
    send({
      type: ListboxEvents.ValueChange,
      value: valueProp!,
    });
  });

  useLayoutEffect(() => {
    send({
      type: ListboxEvents.GetDerivedData,
      data: { options },
    });
  }, [options, send]);

  React.useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      let { target, relatedTarget } = event;
      if (!popoverContainsEventTarget(popoverRef.current, target)) {
        send({
          type: ListboxEvents.OutsideMouseDown,
          relatedTarget: relatedTarget || target,
        });
      }
    }
    if (isExpanded) {
      window.addEventListener("mousedown", handleMouseDown);
    }
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [send, isExpanded]);

  React.useEffect(() => {
    function handleMouseUp(event: MouseEvent) {
      let { target, relatedTarget } = event;
      if (!popoverContainsEventTarget(popoverRef.current, target)) {
        send({
          type: ListboxEvents.OutsideMouseUp,
          relatedTarget: relatedTarget || target,
        });
      }
    }
    if (isExpanded) {
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [send, isExpanded]);

  useCheckStyles("listbox");

  return (
    <DescendantProvider
      context={ListboxDescendantContext}
      items={options}
      set={setOptions}
    >
      <ListboxContext.Provider value={context}>
        <Comp
          {...props}
          ref={ref}
          data-reach-listbox-input=""
          data-state={isExpanded ? "expanded" : "closed"}
          data-value={state.context.value}
          id={id}
        >
          {isFunction(children)
            ? children({
                id,
                isExpanded,
                value: state.context.value,
                selectedOptionRef: selectedOptionRef,
                highlightedOptionRef: highlightedOptionRef,
                valueLabel,
                // TODO: Remove in 1.0
                expanded: isExpanded,
              })
            : children}
        </Comp>
        {(form || name || required) && (
          <input
            ref={hiddenInputRef}
            data-reach-listbox-hidden-input=""
            disabled={disabled}
            form={form}
            name={name}
            readOnly
            required={required}
            tabIndex={-1}
            type="hidden"
            value={state.context.value || ""}
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
    defaultValue: PropTypes.string,
    disabled: PropTypes.bool,
    form: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    value: PropTypes.string,
  };
}

/**
 * @see Docs https://reach.tech/listbox#listboxinput-props
 */
type ListboxInputProps = Pick<
  React.ComponentProps<"select">,
  "form" | "name" | "required"
> & {
  /**
   * The composed listbox expects to receive `ListboxButton` and
   * `ListboxPopover` as children. You can also pass in arbitrary wrapper
   * elements if desired.
   *
   * @see Docs https://reach.tech/listbox#listboxinput-children
   */
  children:
    | React.ReactNode
    | ((
        props: ListboxContextValue & {
          // TODO: Remove in 1.0
          expanded: boolean;
        }
      ) => React.ReactNode);
  /**
   * The default value of an uncontrolled listbox.
   *
   * @see Docs https://reach.tech/listbox#listboxinput-defaultvalue
   */
  defaultValue?: ListboxValue;
  /**
   * Whether or not the listbox is disabled.
   *
   * @see Docs https://reach.tech/listbox#listboxinput-disabled
   */
  disabled?: boolean;
  /**
   * The callback that fires when the listbox value changes.
   *
   * @see Docs https://reach.tech/listbox#listboxinput-onchange
   * @param newValue
   */
  onChange?(newValue: ListboxValue): void;
  /**
   * The current value of a controlled listbox.
   *
   * @see Docs https://reach.tech/listbox#listboxinput-value
   */
  value?: ListboxValue;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Listbox
 *
 * High-level listbox API
 *
 * @example
 * <Listbox>
 *   <ListboxOption value="1">Option 1</ListboxOption>
 *   <ListboxOption value="2">Option 2</ListboxOption>
 *   <ListboxOption value="3">Option 3</ListboxOption>
 * </Listbox>
 *
 * @see Docs https://reach.tech/listbox#listbox-1
 */
const Listbox = forwardRefWithAs<ListboxProps, "div">(function Listbox(
  { arrow = "▼", button, children, portal = true, ...props },
  forwardedRef
) {
  return (
    <ListboxInput {...props} _componentName="Listbox" ref={forwardedRef}>
      {({ value, valueLabel }) => (
        <React.Fragment>
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
          <ListboxPopover portal={portal}>
            <ListboxList>{children}</ListboxList>
          </ListboxPopover>
        </React.Fragment>
      )}
    </ListboxInput>
  );
});

if (__DEV__) {
  Listbox.displayName = "Listbox";
  Listbox.propTypes = {
    ...ListboxInput.propTypes,
    arrow: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    button: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    children: PropTypes.node,
  };
}

/**
 * @see Docs https://reach.tech/listbox#listbox-props
 */
type ListboxProps = Omit<ListboxInputProps, "children"> &
  Pick<React.ComponentProps<"select">, "form" | "name" | "required"> & {
    /**
     * Renders a text string or React node to represent an arrow inside the
     * Listbox button.
     *
     * @see Docs https://reach.tech/listbox#listbox-arrow
     */
    arrow?: React.ReactNode | boolean;
    /**
     * A render function or React node to to render the Listbox button's inner
     * content. See the API for the ListboxButton children prop for details.
     *
     * @see Docs https://reach.tech/listbox#listbox-button
     */
    button?:
      | React.ReactNode
      | ((props: {
          value: ListboxValue | null;
          label: string | null;
        }) => React.ReactNode);
    children: React.ReactNode;
    /**
     * Whether or not the popover should be rendered inside a portal. Defaults to
     * `true`.
     *
     * @see Docs https://reach.tech/listbox#listbox-portal
     */
    portal?: boolean;
  };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxButton
 *
 * The interactive toggle button that triggers the popover for the listbox.
 *
 * @see Docs https://reach.tech/listbox#listbox-button
 */
const ListboxButtonImpl = forwardRefWithAs<ListboxButtonProps, "span">(
  function ListboxButton(
    {
      "aria-label": ariaLabel,
      arrow = false,
      as: Comp = "span",
      children,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      ...props
    },
    forwardedRef
  ) {
    let {
      ariaLabelledBy,
      buttonRef,
      disabled,
      isExpanded,
      listboxId,
      stateData,
      send,
      listboxValueLabel,
    } = React.useContext(ListboxContext);
    let listboxValue = stateData.value;

    let ref = useForkedRef(buttonRef, forwardedRef);

    let handleKeyDown = useKeyDown();

    function handleMouseDown(event: React.MouseEvent) {
      if (!isRightClick(event.nativeEvent)) {
        event.preventDefault();
        event.stopPropagation();
        send({
          type: ListboxEvents.ButtonMouseDown,
          disabled,
        });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (!isRightClick(event.nativeEvent)) {
        event.preventDefault();
        event.stopPropagation();
        send({ type: ListboxEvents.ButtonMouseUp });
      }
    }

    let id = makeId("button", listboxId);

    // If the button has children, we just render them as the label
    // If a user needs the label on the server to prevent hydration mismatch
    // errors, they need to control the state of the component and pass a label
    // directly to the button.
    let label: React.ReactNode = React.useMemo(() => {
      if (!children) {
        return listboxValueLabel;
      } else if (isFunction(children)) {
        return children({
          isExpanded,
          label: listboxValueLabel!,
          value: listboxValue,
          // TODO: Remove in 1.0
          expanded: isExpanded,
        });
      }
      return children;
    }, [children, listboxValueLabel, isExpanded, listboxValue]);

    return (
      <Comp
        // Applicable to all host language elements regardless of whether a
        // `role` is applied.
        // https://www.w3.org/WAI/PF/aria/states_and_properties#global_states_header
        aria-disabled={disabled || undefined}
        // Set by the JavaScript when the listbox is displayed. Otherwise, is
        // not present.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-collapsible.html
        aria-expanded={isExpanded || undefined}
        // Indicates that activating the button displays a listbox.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-collapsible.html
        aria-haspopup="listbox"
        // References the two elements whose labels are concatenated by the
        // browser to label the button. The first element is a span containing
        // perceivable label for the listbox component. The second element is
        // the button itself; the button text is set to the name of the
        // currently chosen element.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-collapsible.html
        // If an `aria-label` is passed, we should skip `aria-labelledby` to
        // avoid confusion.
        aria-labelledby={
          ariaLabel ? undefined : [ariaLabelledBy, id].filter(Boolean).join(" ")
        }
        aria-label={ariaLabel}
        // Identifies the element as a button widget.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/button/button.html
        role="button"
        // Includes the element in the tab sequence.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/button/button.html
        tabIndex={disabled ? -1 : 0}
        {...props}
        ref={ref}
        data-reach-listbox-button=""
        id={id}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
      >
        {label}
        {arrow && (
          <ListboxArrow>{isBoolean(arrow) ? null : arrow}</ListboxArrow>
        )}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxButtonImpl.displayName = "ListboxButton";
  ListboxButtonImpl.propTypes = {
    arrow: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  };
}

const ListboxButton = memoWithAs(ListboxButtonImpl);

/**
 * @see Docs https://reach.tech/listbox#listboxbutton-props
 */
type ListboxButtonProps = {
  /**
   * Renders a text string or React node to represent an arrow inside the
   * button.
   *
   * @see Docs https://reach.tech/listbox#listboxbutton-arrow
   */
  arrow?: React.ReactNode | boolean;
  /**
   * A render function or React node to to render the Listbox button's inner
   * content.
   *
   * By default, the button will display the text label of the selected option
   * as its inner content. This label can be pulled from the option's inner
   * text content or explicitly provided to the ListboxOption component via the
   * label prop. If you want to render the button differently from its default,
   * you must pass children.
   *
   * It's important to note that the ListboxButton's default inner content
   * cannot be server-side rendered. On the initial render, the button has no
   * contextual information about the available options in a Listbox. As each
   * ListboxOption is rendered, it is registered in a context object and updated
   * at the top of the Listbox tree, which evaluates the options and their props
   * to determine which option is selectable and which label to display inside
   * the button. If you need the inner content of the button on the first render
   * you must control the listbox's state and keep its options' values and
   * labels in data at the top of the tree, and render the button directly via
   * children.
   *
   * @example
   * let options = { one: 'One option', two: 'Another option' }
   * let [value, setValue] = React.useState(options.one)
   * return (
   *   <ListboxInput>
   *     <ListboxButton>{options[value]}</ListboxButton>
   *     <ListboxPopover>
   *       <ListboxList>
   *         {Object.keys(options).map(option => (
   *           <ListboxOption key={option} value={option} label={options[option]}>
   *             {options[option]}
   *           </ListboxOption>
   *         ))}
   *       </ListboxList>
   *     </ListboxPopover>
   *   </ListboxInput>
   * )
   */
  children?:
    | React.ReactNode
    | ((props: {
        value: ListboxValue | null;
        label: string;
        isExpanded: boolean;
        // TODO: Remove in 1.0
        expanded: boolean;
      }) => React.ReactNode);
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxArrow
 *
 * A wrapper component for an arrow to display in the `ListboxButton`
 *
 * @see Docs https://reach.tech/listbox#listboxarrow
 */
const ListboxArrowImpl = forwardRefWithAs<ListboxArrowProps, "span">(
  function ListboxArrow(
    { as: Comp = "span", children, ...props },
    forwardedRef
  ) {
    let { isExpanded } = React.useContext(ListboxContext);
    return (
      <Comp
        // The arrow provides no semantic value and its inner content should be
        // hidden from the accessibility tree
        aria-hidden
        {...props}
        ref={forwardedRef}
        data-reach-listbox-arrow=""
        data-expanded={isExpanded ? "" : undefined}
      >
        {isFunction(children)
          ? children({
              isExpanded,
              // TODO: Remove in 1.0
              expanded: isExpanded,
            })
          : children || "▼"}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxArrowImpl.displayName = "ListboxArrow";
  ListboxArrowImpl.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  };
}

const ListboxArrow = memoWithAs(ListboxArrowImpl);

/**
 * @see Docs https://reach.tech/listbox#listboxarrow-props
 */
type ListboxArrowProps = {
  /**
   * Children to render as the listbox button's arrow. This can be a render
   * function that accepts the listbox's expanded state as an argument.
   */
  children?:
    | React.ReactNode
    | ((props: {
        isExpanded: boolean;
        // TODO: Remove in 1.0
        expanded: boolean;
      }) => React.ReactNode);
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxPopover
 *
 * The popover containing the list of options.
 *
 * @see Docs https://reach.tech/listbox#listboxpopover
 */
const ListboxPopoverImpl = forwardRefWithAs<ListboxPopoverProps, "div">(
  function ListboxPopover(
    {
      as: Comp = "div",
      position = positionMatchWidth,
      onBlur,
      onKeyDown,
      portal = true,
      unstable_observableRefs,
      ...props
    },
    forwardedRef
  ) {
    let { buttonRef, popoverRef, send, isExpanded } = React.useContext(
      ListboxContext
    );
    let ref = useForkedRef(popoverRef, forwardedRef);

    let handleKeyDown = useKeyDown();

    let commonProps = {
      hidden: !isExpanded,
      tabIndex: -1,
      ...props,
      ref,
      "data-reach-listbox-popover": "",
      onBlur: wrapEvent(onBlur, handleBlur),
      onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
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
        as={Comp}
        targetRef={buttonRef as any}
        position={position}
        unstable_observableRefs={unstable_observableRefs}
      />
    ) : (
      <Comp {...commonProps} />
    );
  }
);

if (__DEV__) {
  ListboxPopoverImpl.displayName = "ListboxPopover";
  ListboxPopoverImpl.propTypes = {
    children: PropTypes.node.isRequired,
    portal: PropTypes.bool,
    position: PropTypes.func,
  };
}

const ListboxPopover = memoWithAs(ListboxPopoverImpl);

/**
 * @see Docs https://reach.tech/listbox#listboxpopover-props
 */
type ListboxPopoverProps = {
  /**
   * `ListboxPopover` expects to receive `ListboxList` as its children.
   *
   * @see Docs https://reach.tech/listbox#listboxpopover-children
   */
  children: React.ReactNode;
  /**
   * Whether or not the popover should be rendered inside a portal. Defaults to
   * `true`
   *
   * @see Docs https://reach.tech/listbox#listboxpopover-portal
   */
  portal?: boolean;
  /**
   * The positioning function for the popover.
   *
   * @see Docs https://reach.tech/listbox#listboxpopover-position
   */
  position?: PopoverProps["position"];
  unstable_observableRefs?: PopoverProps["unstable_observableRefs"];
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxList
 *
 * The list containing all listbox options.
 *
 * @see Docs https://reach.tech/listbox#listboxlist
 */
const ListboxList = forwardRefWithAs<ListboxListProps, "ul">(
  function ListboxList({ as: Comp = "ul", ...props }, forwardedRef) {
    let {
      ariaLabel,
      ariaLabelledBy,
      isExpanded,
      listboxId,
      listRef,
      stateData: { value, navigationValue },
    } = React.useContext(ListboxContext);
    let ref = useForkedRef(forwardedRef, listRef);

    return (
      <Comp
        // Tells assistive technologies which of the options, if any, is
        // visually indicated as having keyboard focus. DOM focus remains on the
        // `ul` element and the idref specified for `aria-activedescendant`
        // refers to the `li` element that is visually styled as focused. When
        // navigation keys, such as `Down Arrow`, are pressed, the JavaScript
        // changes the value.
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-grouped.html
        aria-activedescendant={useOptionId(
          isExpanded ? navigationValue : value
        )}
        // If the listbox is not part of another widget, then it has a visible
        // label referenced by `aria-labelledby` on the element with role
        // `listbox`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox
        // If an `aria-label` is passed, we should skip `aria-labelledby` to
        // avoid confusion.
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        aria-label={ariaLabel}
        // An element that contains or owns all the listbox options has role
        // listbox.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox
        role="listbox"
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-collapsible.html
        tabIndex={-1}
        {...props}
        ref={ref}
        data-reach-listbox-list=""
        id={makeId("listbox", listboxId)}
      />
    );
  }
);

if (__DEV__) {
  ListboxList.displayName = "ListboxList";
  ListboxList.propTypes = {};
}

/**
 * @see Docs https://reach.tech/listbox#listboxlist-props
 */
type ListboxListProps = {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxOption
 *
 * A selectable option for the listbox.
 *
 * @see Docs https://reach.tech/listbox#listboxoption
 */
const ListboxOption = forwardRefWithAs<ListboxOptionProps, "li">(
  function ListboxOption(
    {
      as: Comp = "li",
      children,
      disabled,
      onClick,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      onTouchStart,
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
      highlightedOptionRef,
      isExpanded,
      onValueChange,
      selectedOptionRef,
      send,
      state,
      stateData: { value: listboxValue, navigationValue },
    } = React.useContext(ListboxContext);

    let [labelState, setLabel] = React.useState(labelProp);
    let label = labelProp || labelState || "";

    let ownRef = React.useRef<HTMLElement | null>(null);
    useDescendant(
      {
        element: ownRef.current!,
        value,
        label,
        disabled: !!disabled,
      },
      ListboxDescendantContext
    );

    // After the ref is mounted to the DOM node, we check to see if we have an
    // explicit label prop before looking for the node's textContent for
    // typeahead functionality.
    let getLabelFromDomNode = React.useCallback(
      (node: HTMLElement) => {
        if (!labelProp && node) {
          setLabel((prevState) => {
            if (node.textContent && prevState !== node.textContent) {
              return node.textContent;
            }
            return prevState || "";
          });
        }
      },
      [labelProp]
    );

    let isHighlighted = navigationValue ? navigationValue === value : false;
    let isSelected = listboxValue === value;

    let ref = useForkedRef(
      getLabelFromDomNode,
      forwardedRef,
      ownRef,
      isSelected ? selectedOptionRef : null,
      isHighlighted ? highlightedOptionRef : null
    );

    function handleMouseEnter() {
      send({
        type: ListboxEvents.OptionMouseEnter,
        value,
        disabled: !!disabled,
      });
    }

    function handleTouchStart() {
      send({
        type: ListboxEvents.OptionTouchStart,
        value,
        disabled: !!disabled,
      });
    }

    function handleMouseLeave() {
      send({ type: ListboxEvents.ClearNavSelection });
    }

    function handleMouseDown(event: React.MouseEvent) {
      // Prevent blur event from firing and bubbling to the popover
      if (!isRightClick(event.nativeEvent)) {
        event.preventDefault();
        send({ type: ListboxEvents.OptionMouseDown });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (!isRightClick(event.nativeEvent)) {
        send({
          type: ListboxEvents.OptionMouseUp,
          value,
          callback: onValueChange,
          disabled: !!disabled,
        });
      }
    }

    function handleClick(event: React.MouseEvent) {
      // Generally an option will be selected on mouseup, but in case this isn't
      // handled correctly by the device (whether because it's a touch/pen or
      // virtual click event) we want to handle selection on a full click event
      // just in case. This should address issues with screenreader selection,
      // but this needs more robust testing.
      if (!isRightClick(event.nativeEvent)) {
        send({
          type: ListboxEvents.OptionClick,
          value,
          callback: onValueChange,
          disabled: !!disabled,
        });
      }
    }

    function handleMouseMove() {
      // We don't really *need* these guards since we put all of our transition
      // logic in the state machine, but in this case it seems wise not to
      // needlessly run our transitions every time the user's mouse moves. Seems
      // like a lot. 🙃
      if (state === ListboxStates.Open || navigationValue !== value) {
        send({
          type: ListboxEvents.OptionMouseMove,
          value,
          disabled: !!disabled,
        });
      }
    }

    return (
      <Comp
        // In a single-select listbox, the selected option has `aria-selected`
        // set to `true`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox
        aria-selected={(isExpanded ? isHighlighted : isSelected) || undefined}
        // Applicable to all host language elements regardless of whether a
        // `role` is applied.
        // https://www.w3.org/WAI/PF/aria/states_and_properties#global_states_header
        aria-disabled={disabled || undefined}
        // Each option in the listbox has role `option` and is a DOM descendant
        // of the element with role `listbox`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox
        role="option"
        {...props}
        ref={ref}
        id={useOptionId(value)}
        data-reach-listbox-option=""
        data-current-nav={isHighlighted ? "" : undefined}
        data-current-selected={isSelected ? "" : undefined}
        data-label={label}
        data-value={value}
        onClick={wrapEvent(onClick, handleClick)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseEnter={wrapEvent(onMouseEnter, handleMouseEnter)}
        onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
        onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        onTouchStart={wrapEvent(onTouchStart, handleTouchStart)}
      >
        {children}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxOption.displayName = "ListboxOption";
  ListboxOption.propTypes = {
    disabled: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
  };
}

/**
 * @see Docs https://reach.tech/listbox#listboxoption-props
 */
type ListboxOptionProps = {
  /**
   * The option's value. This will be passed into a hidden input field for use
   * in forms.
   *
   * @see Docs https://reach.tech/listbox#listboxoption-value
   */
  value: ListboxValue;
  /**
   * The option's human-readable label. This prop is optional but highly
   * encouraged if your option has multiple text nodes that may or may not
   * correlate with the intended value. It is also useful if the inner text node
   * begins with a character other than a readable letter (like an emoji or
   * symbol) so that typeahead works as expected for the user.
   *
   * @see Docs https://reach.tech/listbox#listboxoption-label
   */
  label?: string;
  /**
   * Whether or not the option is disabled from selection and navigation.
   *
   * @see Docs https://reach.tech/listbox#listboxoption-disabled
   */
  disabled?: boolean;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroup
 *
 * A group of related listbox options.
 *
 * @see Docs https://reach.tech/listbox#listboxgroup
 */
const ListboxGroup = forwardRefWithAs<ListboxGroupProps, "div">(
  function ListboxGroup(
    { as: Comp = "div", label, children, ...props },
    forwardedRef
  ) {
    let { listboxId } = React.useContext(ListboxContext);
    let labelId = makeId("label", useId(props.id), listboxId);
    return (
      <ListboxGroupContext.Provider value={{ labelId }}>
        <Comp
          // Refers to the element containing the option group label
          // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-grouped.html
          aria-labelledby={labelId}
          // Identifies a group of related options
          // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-grouped.html
          role="group"
          {...props}
          data-reach-listbox-group=""
          ref={forwardedRef}
        >
          {label && <ListboxGroupLabel>{label}</ListboxGroupLabel>}
          {children}
        </Comp>
      </ListboxGroupContext.Provider>
    );
  }
);

if (__DEV__) {
  ListboxGroup.displayName = "ListboxGroup";
  ListboxGroup.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  };
}

/**
 * @see Docs https://reach.tech/listbox#listboxgroup-props
 */
type ListboxGroupProps = {
  /**
   * The text label to use for the listbox group. This can be omitted if a
   * group contains a `ListboxGroupLabel` component. The label should always
   * be human-readable.
   *
   * @see Docs https://reach.tech/listbox#listboxgroup-label
   */
  label?: React.ReactNode;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroupLabel
 *
 * @see Docs https://reach.tech/listbox#listboxgrouplabel
 */
const ListboxGroupLabel = forwardRefWithAs<ListboxGroupLabelProps, "span">(
  function ListboxGroupLabel({ as: Comp = "span", ...props }, forwardedRef) {
    let { labelId } = React.useContext(ListboxGroupContext);
    return (
      <Comp
        // See examples
        // https://www.w3.org/TR/wai-aria-practices-1.2/examples/listbox/listbox-grouped.html
        role="presentation"
        {...props}
        ref={forwardedRef}
        data-reach-listbox-group-label=""
        id={labelId}
      />
    );
  }
);

if (__DEV__) {
  ListboxGroupLabel.displayName = "ListboxGroupLabel";
  ListboxGroupLabel.propTypes = {};
}

/**
 * @see Docs https://reach.tech/listbox#listboxgroup-props
 */
type ListboxGroupLabelProps = {};

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Listbox` component to its descendants.
 *
 * @see Docs https://reach.tech/listbox#uselistboxcontext
 */
function useListboxContext(): ListboxContextValue {
  let {
    highlightedOptionRef,
    listboxId,
    listboxValueLabel,
    isExpanded,
    selectedOptionRef,
    stateData: { value },
  } = React.useContext(ListboxContext);
  return React.useMemo(
    () => ({
      id: listboxId,
      isExpanded,
      selectedOptionRef: selectedOptionRef,
      highlightedOptionRef: highlightedOptionRef,
      value,
      valueLabel: listboxValueLabel,
    }),
    [
      listboxId,
      isExpanded,
      value,
      listboxValueLabel,
      selectedOptionRef,
      highlightedOptionRef,
    ]
  );
}

////////////////////////////////////////////////////////////////////////////////

function isListboxExpanded(state: string) {
  return [
    ListboxStates.Navigating,
    ListboxStates.Open,
    ListboxStates.Dragging,
    ListboxStates.Interacting,
  ].includes(state as ListboxStates);
}

function useKeyDown() {
  let {
    disabled: listboxDisabled,
    onValueChange,
    stateData: { navigationValue, typeaheadQuery },
    send,
  } = React.useContext(ListboxContext);
  let options = useDescendants(ListboxDescendantContext);

  React.useEffect(() => {
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
    function (event: React.KeyboardEvent) {
      let { key } = event;
      let isSearching = isString(key) && key.length === 1;
      let navOption = options.find(
        (option) => option.value === navigationValue
      );
      switch (key) {
        case "Enter":
          send({
            type: ListboxEvents.KeyDownEnter,
            value: navigationValue,
            callback: onValueChange,
            disabled: !!(navOption?.disabled || listboxDisabled),
          });
          return;
        case " ":
          // Prevent browser from scrolling down
          event.preventDefault();
          send({
            type: ListboxEvents.KeyDownSpace,
            value: navigationValue,
            callback: onValueChange,
            disabled: !!(navOption?.disabled || listboxDisabled),
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
              disabled: listboxDisabled,
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
      filter: (option) => !option.disabled,
      callback(nextIndex: number) {
        send({
          type: ListboxEvents.KeyDownNavigate,
          value: options[nextIndex].value,
          disabled: listboxDisabled,
        });
      },
    })
  );

  return handleKeyDown;
}

function useOptionId(value: ListboxValue | null) {
  let { listboxId } = React.useContext(ListboxContext);
  return value ? makeId(`option-${value}`, listboxId) : undefined;
}

function popoverContainsEventTarget(
  popover: HTMLElement | null,
  target: HTMLElement | EventTarget | null
) {
  return !!(popover && popover.contains(target as HTMLElement));
}

////////////////////////////////////////////////////////////////////////////////
// Types

type ListboxValue = string;

type ListboxDescendant = Descendant<HTMLElement> & {
  value: ListboxValue;
  label: string;
  disabled: boolean;
};

type ListboxContextValue = {
  id: string | undefined;
  isExpanded: boolean;
  highlightedOptionRef: React.RefObject<ListboxNodeRefs["highlightedOption"]>;
  selectedOptionRef: React.RefObject<ListboxNodeRefs["selectedOption"]>;
  value: ListboxValue | null;
  valueLabel: string | null;
};

interface InternalListboxContextValue {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  buttonRef: React.RefObject<ListboxNodeRefs["button"]>;
  isExpanded: boolean;
  listRef: React.RefObject<ListboxNodeRefs["list"]>;
  popoverRef: React.RefObject<ListboxNodeRefs["popover"]>;
  selectedOptionRef: React.RefObject<ListboxNodeRefs["selectedOption"]>;
  highlightedOptionRef: React.RefObject<ListboxNodeRefs["highlightedOption"]>;
  disabled: boolean;
  listboxId: string;
  listboxValueLabel: string | null;
  onValueChange: ((newValue: ListboxValue) => void) | null | undefined;
  send: StateMachine.Service<
    ListboxStateData,
    DistributiveOmit<ListboxEvent, "refs">
  >["send"];
  state: ListboxStates;
  stateData: ListboxStateData;
}

interface ListboxGroupContextValue {
  labelId: string;
}

function useControlledStateSync<T>(
  controlPropValue: T | undefined,
  internalValue: T,
  send: any
) {
  let { current: isControlled } = React.useRef(controlPropValue != null);
  if (isControlled && controlPropValue !== internalValue) {
    send();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  ListboxArrowProps,
  ListboxButtonProps,
  ListboxContextValue,
  ListboxDescendant,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxInputProps,
  ListboxListProps,
  ListboxOptionProps,
  ListboxPopoverProps,
  ListboxProps,
  ListboxValue,
};
export {
  Listbox,
  ListboxArrow,
  ListboxButton,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
  useListboxContext,
};
